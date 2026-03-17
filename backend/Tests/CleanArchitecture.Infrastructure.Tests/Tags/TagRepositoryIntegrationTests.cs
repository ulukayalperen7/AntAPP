using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;

namespace CleanArchitecture.Infrastructure.Tests.Tags;

public class TagRepositoryIntegrationTests : IAsyncDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly TagRepositoryAsync _repository;
    private Guid? _createdTagId;

    public TagRepositoryIntegrationTests()
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(FindWebApiProjectDirectory())
            .AddJsonFile("appsettings.Development.json", optional: false)
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not found in appsettings.Development.json");

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(connectionString, b => b.UseNetTopologySuite())
            .Options;

        var dateTimeMock = new Mock<IDateTimeService>();
        dateTimeMock.Setup(x => x.NowUtc).Returns(DateTime.UtcNow);

        var authUserMock = new Mock<IAuthenticatedUserService>();
        authUserMock.Setup(x => x.UserId).Returns("integration-test-user");

        _context = new ApplicationDbContext(options, dateTimeMock.Object, authUserMock.Object);
        _repository = new TagRepositoryAsync(_context);
    }

    [Fact]
    public async Task AddAsync_ShouldPersistTag_WhenDatabaseIsReachable()
    {
        var tagName = "Tarih_mesela";
        var tag = new Tag
        {
            Name = tagName,
            IsActive = true
        };

        await _repository.AddAsync(tag);
        _createdTagId = tag.Id;

        var saved = await _context.Tags
            .FirstOrDefaultAsync(t => t.Id == tag.Id);

        Assert.NotNull(saved);
        Assert.Equal(tagName, saved.Name);
        Assert.True(saved.IsActive);
    }

    public async ValueTask DisposeAsync()
    {
        if (_createdTagId.HasValue)
        {
            await _context.Tags
                .Where(t => t.Id == _createdTagId.Value)
                .ExecuteDeleteAsync();
        }

        await _context.DisposeAsync();
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
                return candidate;

            dir = dir.Parent;
        }

        throw new DirectoryNotFoundException(
            "Could not locate CleanArchitecture.WebApi directory. " +
            "Make sure appsettings.Development.json exists in the WebApi project.");
    }
}
