using Ant.Application.DTOs.Account;
using Ant.Core.Enums;
using Ant.Application.Interfaces;
using Ant.Application.Settings;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Models;
using Ant.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace Ant.Infrastructure.Tests.Account;

public class AuthServiceIntegrationTests : IAsyncDisposable
{
    private readonly ServiceProvider _serviceProvider;
    private readonly List<Guid> _createdUserIds = new();

    public AuthServiceIntegrationTests()
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(FindWebApiProjectDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: false)
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not found in appsettings.Development.json");

        var authenticatedUserMock = new Mock<IAuthenticatedUserService>();
        var emailServiceMock = new Mock<IEmailService>();
        var services = new ServiceCollection();

        services.AddLogging();
        services.AddHttpContextAccessor();
        services.AddSingleton(authenticatedUserMock.Object);
        services.AddSingleton<IDateTimeService>(new DateTimeService());
        services.AddSingleton(emailServiceMock.Object);
        services.Configure<JWTSettings>(configuration.GetSection("JWTSettings"));
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString, builder => builder.UseNetTopologySuite()));
        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();
        services.AddTransient<IAuthService, AuthService>();

        _serviceProvider = services.BuildServiceProvider();

        using var scope = _serviceProvider.CreateScope();
        scope.ServiceProvider.GetRequiredService<ApplicationDbContext>().Database.Migrate();
    }

    [Fact]
    public async Task RegisterAsync_PersistsUserTypeOnApplicationUser()
    {
        using var scope = _serviceProvider.CreateScope();
        await EnsureRolesExistAsync(scope.ServiceProvider);
        SetHttpContext(scope.ServiceProvider);

        var accountService = scope.ServiceProvider.GetRequiredService<IAuthService>();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var request = CreateRegisterRequest();

        var result = await accountService.RegisterAsync(request, "http://localhost:3000");

        var applicationUser = await context.Users
            .AsNoTracking()
            .SingleAsync(user => user.Email == request.Email);
        var domainUser = await context.DomainUsers
            .AsNoTracking()
            .SingleAsync(user => user.Id == applicationUser.Id);

        _createdUserIds.Add(applicationUser.Id);

        Assert.Equal(request.UserType, applicationUser.UserType);
        Assert.Equal(request.UserName, domainUser.UserName);
        Assert.Contains("confirm-email", result);
    }

    [Fact]
    public async Task AuthenticateAsync_ReturnsTokens_ForConfirmedUser()
    {
        var request = CreateRegisterRequest();

        // Register in its own scope so the DbContext is disposed afterwards
        using (var registerScope = _serviceProvider.CreateScope())
        {
            await EnsureRolesExistAsync(registerScope.ServiceProvider);
            SetHttpContext(registerScope.ServiceProvider);
            await registerScope.ServiceProvider
                .GetRequiredService<IAuthService>()
                .RegisterAsync(request, "http://localhost:3000");
        }

        // Confirm email in a separate scope so no tracked entity bleeds through
        Guid userId;
        using (var confirmScope = _serviceProvider.CreateScope())
        {
            var userManager = confirmScope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var user = await userManager.FindByEmailAsync(request.Email)
                ?? throw new InvalidOperationException("Registered user was not found.");
            userId = user.Id;
            _createdUserIds.Add(userId);

            user.EmailConfirmed = true;
            var updateResult = await userManager.UpdateAsync(user);
            Assert.True(updateResult.Succeeded, string.Join(", ", updateResult.Errors.Select(e => e.Description)));
        }

        // Authenticate in a third scope
        using var loginScope = _serviceProvider.CreateScope();
        SetHttpContext(loginScope.ServiceProvider);
        var response = await loginScope.ServiceProvider
            .GetRequiredService<IAuthService>()
            .AuthenticateAsync(new AuthenticationRequest
            {
                Email = request.Email,
                Password = request.Password
            }, "127.0.0.1");

        Assert.Equal(userId.ToString(), response.Id);
        Assert.False(string.IsNullOrWhiteSpace(response.JWToken));
        Assert.False(string.IsNullOrWhiteSpace(response.RefreshToken));
        Assert.Contains(RoleNames.BasicUser, response.Roles);
    }

    public async ValueTask DisposeAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (_createdUserIds.Count > 0)
        {
            await context.Set<IdentityUserRole<Guid>>()
                .Where(userRole => _createdUserIds.Contains(userRole.UserId))
                .ExecuteDeleteAsync();

            await context.DomainUsers
                .Where(user => _createdUserIds.Contains(user.Id))
                .ExecuteDeleteAsync();

            await context.Users
                .Where(user => _createdUserIds.Contains(user.Id))
                .ExecuteDeleteAsync();
        }

        await _serviceProvider.DisposeAsync();
    }

    private static RegisterRequest CreateRegisterRequest()
    {
        var suffix = Guid.NewGuid().ToString("N")[..12];
        var password = "Secret1!";

        return new RegisterRequest
        {
            UserType = UserTypeEnum.BusinessUser,
            Email = $"account-service-{suffix}@example.com",
            UserName = $"account{suffix}",
            Password = password,
            ConfirmPassword = password
        };
    }

    private static async Task EnsureRolesExistAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

        foreach (var roleName in new[] { RoleNames.BasicUser, RoleNames.BusinessUser, RoleNames.Admin })
        {
            if (await roleManager.RoleExistsAsync(roleName))
            {
                continue;
            }

            var result = await roleManager.CreateAsync(new IdentityRole<Guid> { Name = roleName });
            if (!result.Succeeded)
            {
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(error => error.Description)));
            }
        }
    }

    private static void SetHttpContext(IServiceProvider serviceProvider)
    {
        var httpContextAccessor = serviceProvider.GetRequiredService<IHttpContextAccessor>();
        httpContextAccessor.HttpContext = new DefaultHttpContext
        {
            RequestServices = serviceProvider
        };
    }

    private static string FindWebApiProjectDirectory()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);

        while (dir != null)
        {
            var candidate = Path.Combine(
                dir.FullName,
                "Ant", "Ant.WebApi");

            if (Directory.Exists(candidate))
            {
                return candidate;
            }

            dir = dir.Parent;
        }

        throw new DirectoryNotFoundException(
            "Could not locate Ant.WebApi directory. " +
            "Make sure appsettings.Development.json exists in the WebApi project.");
    }
}
