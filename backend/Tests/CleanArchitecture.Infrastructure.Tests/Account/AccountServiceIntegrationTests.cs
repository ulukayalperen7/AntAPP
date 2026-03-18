using CleanArchitecture.Core.DTOs.Account;
using CleanArchitecture.Core.Enums;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Settings;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Models;
using CleanArchitecture.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace CleanArchitecture.Infrastructure.Tests.Account;

public class AccountServiceIntegrationTests : IAsyncDisposable
{
    private readonly ServiceProvider _serviceProvider;
    private readonly List<Guid> _createdUserIds = new();

    public AccountServiceIntegrationTests()
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
        services.AddTransient<IAccountService, AccountService>();

        _serviceProvider = services.BuildServiceProvider();
    }

    [Fact]
    public async Task RegisterAsync_PersistsUserTypeOnApplicationUser()
    {
        using var scope = _serviceProvider.CreateScope();
        await EnsureRolesExistAsync(scope.ServiceProvider);
        SetHttpContext(scope.ServiceProvider);

        var accountService = scope.ServiceProvider.GetRequiredService<IAccountService>();
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
        using var scope = _serviceProvider.CreateScope();
        await EnsureRolesExistAsync(scope.ServiceProvider);
        SetHttpContext(scope.ServiceProvider);

        var accountService = scope.ServiceProvider.GetRequiredService<IAccountService>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var request = CreateRegisterRequest();

        await accountService.RegisterAsync(request, "http://localhost:3000");

        var user = await userManager.FindByEmailAsync(request.Email)
            ?? throw new InvalidOperationException("Registered user was not found.");
        _createdUserIds.Add(user.Id);

        user.EmailConfirmed = true;
        var updateResult = await userManager.UpdateAsync(user);
        Assert.True(updateResult.Succeeded, string.Join(", ", updateResult.Errors.Select(error => error.Description)));

        var response = await accountService.AuthenticateAsync(new AuthenticationRequest
        {
            Email = request.Email,
            Password = request.Password
        }, "127.0.0.1");

        Assert.Equal(user.Id.ToString(), response.Id);
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
                "CleanArchitecture", "CleanArchitecture.WebApi");

            if (Directory.Exists(candidate))
            {
                return candidate;
            }

            dir = dir.Parent;
        }

        throw new DirectoryNotFoundException(
            "Could not locate CleanArchitecture.WebApi directory. " +
            "Make sure appsettings.Development.json exists in the WebApi project.");
    }
}
