using Ant.Core.Entities;
using Ant.Application.Interfaces;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;

namespace Ant.Infrastructure.Tests.Collections;

public class CollectionRepositoryIntegrationTests : IAsyncDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly CollectionRepositoryAsync _repository;
    private readonly Guid _testUserId = Guid.NewGuid();
    private readonly List<Guid> _createdCollectionIds = new();
    private readonly List<Guid> _extraUserIds = new();

    public CollectionRepositoryIntegrationTests()
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
        authUserMock.Setup(x => x.UserId).Returns(_testUserId.ToString());

        _context = new ApplicationDbContext(options, dateTimeMock.Object, authUserMock.Object);
        _context.Database.MigrateAsync().GetAwaiter().GetResult();
        EnsureTestSchemaAsync().GetAwaiter().GetResult();
        _repository = new CollectionRepositoryAsync(_context);

        SeedTestUserAsync().GetAwaiter().GetResult();
    }

    private Task SeedExtraUserAsync(Guid userId) => SeedUserRowsAsync(userId);

    // Collections.UserId → Users.Id → AspNetUsers.Id
    // Insert a minimal AspNetUsers row first, then the Users row.
    private async Task SeedTestUserAsync() => await SeedUserRowsAsync(_testUserId);

    private async Task SeedUserRowsAsync(Guid userId)
    {
        var db = _context.Database;
        await db.ExecuteSqlRawAsync("""
            INSERT INTO "AspNetUsers"
                ("Id","UserName","NormalizedUserName","Email","NormalizedEmail",
                 "EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp",
                 "PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnabled",
                 "AccessFailedCount","UserType")
            VALUES
                ({0}, {1}, {2}, {3}, {4},
                 false, '', gen_random_uuid()::text, gen_random_uuid()::text,
                 false, false, false,
                 0, 0)
            ON CONFLICT ("Id") DO NOTHING
            """,
            userId,
            $"seed_{userId:N}",
            $"SEED_{userId:N}",
            $"seed_{userId:N}@test.local",
            $"SEED_{userId:N}@TEST.LOCAL");

        await db.ExecuteSqlRawAsync("""
            INSERT INTO "Users" ("Id","UserName","ProfilePhotoUrl")
            VALUES ({0}, {1}, '')
            ON CONFLICT ("Id") DO NOTHING
            """,
            userId,
            $"seed_{userId:N}");
    }

    private async Task EnsureTestSchemaAsync()
    {
        await _context.Database.ExecuteSqlRawAsync("""
            ALTER TABLE "Routes"
            ADD COLUMN IF NOT EXISTS "ContentType" integer NOT NULL DEFAULT 1;
            """);
    }

    [Fact]
    public async Task AddAsync_ShouldPersistCollection()
    {
        var collection = new Collection
        {
            UserId = _testUserId,
            Name = "Integration Test Collection",
            IsDefault = false,
            IsPublic = true,
            Description = "Test description",
            ThumbnailUrl = string.Empty
        };

        await _repository.AddAsync(collection);
        _createdCollectionIds.Add(collection.Id);

        var saved = await _context.Collections
            .FirstOrDefaultAsync(c => c.Id == collection.Id);

        Assert.NotNull(saved);
        Assert.Equal("Integration Test Collection", saved.Name);
        Assert.Equal(_testUserId, saved.UserId);
        Assert.True(saved.IsPublic);
    }

    [Fact]
    public async Task GetCollectionsByUserIdAsync_ShouldReturnOnlyUserCollections()
    {
        var otherId = Guid.NewGuid();
        await SeedExtraUserAsync(otherId);

        var c1 = new Collection { UserId = _testUserId, Name = "User Collection 1", Description = string.Empty, ThumbnailUrl = string.Empty };
        var c2 = new Collection { UserId = _testUserId, Name = "User Collection 2", Description = string.Empty, ThumbnailUrl = string.Empty };
        var other = new Collection { UserId = otherId, Name = "Other User", Description = string.Empty, ThumbnailUrl = string.Empty };

        await _repository.AddAsync(c1);
        await _repository.AddAsync(c2);
        await _repository.AddAsync(other);
        _createdCollectionIds.AddRange(new[] { c1.Id, c2.Id, other.Id });
        _extraUserIds.Add(otherId);

        var results = await _repository.GetCollectionsByUserIdAsync(_testUserId, 1, 10);

        Assert.True(results.Count >= 2);
        Assert.All(results, c => Assert.Equal(_testUserId, c.UserId));
    }

    [Fact]
    public async Task GetOrCreateDefaultCollectionAsync_CreatesOnFirstCall_ReturnsExistingOnSecond()
    {
        var userId = Guid.NewGuid();
        await SeedExtraUserAsync(userId);
        _extraUserIds.Add(userId);

        var first = await _repository.GetOrCreateDefaultCollectionAsync(userId);
        _createdCollectionIds.Add(first.Id);

        Assert.NotNull(first);
        Assert.True(first.IsDefault);
        Assert.Equal("Saved Routes", first.Name);
        Assert.Equal(userId, first.UserId);

        var second = await _repository.GetOrCreateDefaultCollectionAsync(userId);

        Assert.Equal(first.Id, second.Id);
    }

    [Fact]
    public async Task GetDefaultCollectionAsync_ReturnsNull_WhenNoDefault()
    {
        var result = await _repository.GetDefaultCollectionAsync(Guid.NewGuid());
        Assert.Null(result);
    }

    [Fact]
    public async Task GetAllCollectionsPagedAsync_ReturnsPaginatedResults()
    {
        var c1 = new Collection { UserId = _testUserId, Name = "Page Test 1", Description = string.Empty, ThumbnailUrl = string.Empty };
        var c2 = new Collection { UserId = _testUserId, Name = "Page Test 2", Description = string.Empty, ThumbnailUrl = string.Empty };
        var c3 = new Collection { UserId = _testUserId, Name = "Page Test 3", Description = string.Empty, ThumbnailUrl = string.Empty };

        await _repository.AddAsync(c1);
        await _repository.AddAsync(c2);
        await _repository.AddAsync(c3);
        _createdCollectionIds.AddRange(new[] { c1.Id, c2.Id, c3.Id });

        var page = await _repository.GetAllCollectionsPagedAsync(1, 2);

        Assert.True(page.Count <= 2);
    }

    [Fact]
    public async Task CollectionRoute_AddAndRemove_WorksCorrectly()
    {
        var collection = new Collection
        {
            UserId = _testUserId,
            Name = "Route Test Collection",
            Description = string.Empty,
            ThumbnailUrl = string.Empty
        };
        await _repository.AddAsync(collection);
        _createdCollectionIds.Add(collection.Id);

        var route = new Route
        {
            AuthorUserId = _testUserId,
            Title = "Test Route for Collection",
            Description = string.Empty,
            ThumbnailUrl = string.Empty,
            ContentType = Ant.Core.Enums.RouteContentTypeEnum.Community,
            IsPublic = true
        };
        await _context.Routes.AddAsync(route);
        await _context.SaveChangesAsync();

        try
        {
            var collectionRoute = new CollectionRoute
            {
                CollectionId = collection.Id,
                RouteId = route.Id,
                SavedAt = DateTime.UtcNow
            };
            await _repository.AddCollectionRouteAsync(collectionRoute);

            var found = await _repository.GetCollectionRouteAsync(collection.Id, route.Id);
            Assert.NotNull(found);
            Assert.Equal(collection.Id, found.CollectionId);
            Assert.Equal(route.Id, found.RouteId);

            await _repository.RemoveCollectionRouteAsync(found);

            var afterRemove = await _repository.GetCollectionRouteAsync(collection.Id, route.Id);
            Assert.Null(afterRemove);
        }
        finally
        {
            await _context.CollectionRoutes
                .Where(cr => cr.CollectionId == collection.Id && cr.RouteId == route.Id)
                .ExecuteDeleteAsync();
            await _context.Routes
                .Where(r => r.Id == route.Id)
                .ExecuteDeleteAsync();
        }
    }

    [Fact]
    public async Task GetCollectionWithRoutesAsync_IncludesRouteDetails()
    {
        var collection = new Collection
        {
            UserId = _testUserId,
            Name = "Detail Test",
            Description = string.Empty,
            ThumbnailUrl = string.Empty
        };
        await _repository.AddAsync(collection);
        _createdCollectionIds.Add(collection.Id);

        var route = new Route
        {
            AuthorUserId = _testUserId,
            Title = "Included Route",
            Description = string.Empty,
            ThumbnailUrl = "https://thumb.test/1.jpg",
            ContentType = Ant.Core.Enums.RouteContentTypeEnum.Community,
            IsPublic = true
        };
        await _context.Routes.AddAsync(route);
        await _context.SaveChangesAsync();

        try
        {
            var cr = new CollectionRoute
            {
                CollectionId = collection.Id,
                RouteId = route.Id,
                SavedAt = DateTime.UtcNow
            };
            await _repository.AddCollectionRouteAsync(cr);

            var result = await _repository.GetCollectionWithRoutesAsync(collection.Id);

            Assert.NotNull(result);
            Assert.Equal("Detail Test", result.Name);
            Assert.Single(result.CollectionRoutes);
            Assert.Equal("Included Route", result.CollectionRoutes.First().Route.Title);
        }
        finally
        {
            await _context.CollectionRoutes
                .Where(x => x.CollectionId == collection.Id && x.RouteId == route.Id)
                .ExecuteDeleteAsync();
            await _context.Routes
                .Where(r => r.Id == route.Id)
                .ExecuteDeleteAsync();
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_createdCollectionIds.Count > 0)
        {
            await _context.CollectionRoutes
                .Where(cr => _createdCollectionIds.Contains(cr.CollectionId))
                .ExecuteDeleteAsync();

            await _context.Collections
                .Where(c => _createdCollectionIds.Contains(c.Id))
                .ExecuteDeleteAsync();
        }

        foreach (var extraId in _extraUserIds)
        {
            await _context.Database.ExecuteSqlRawAsync(
                """DELETE FROM "Users" WHERE "Id" = {0}""", extraId);
            await _context.Database.ExecuteSqlRawAsync(
                """DELETE FROM "AspNetUsers" WHERE "Id" = {0}""", extraId);
        }

        await _context.Database.ExecuteSqlRawAsync(
            """DELETE FROM "Users" WHERE "Id" = {0}""", _testUserId);
        await _context.Database.ExecuteSqlRawAsync(
            """DELETE FROM "AspNetUsers" WHERE "Id" = {0}""", _testUserId);

        await _context.DisposeAsync();
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
                return candidate;

            dir = dir.Parent;
        }

        throw new DirectoryNotFoundException(
            "Could not locate Ant.WebApi directory. " +
            "Make sure appsettings.Development.json exists in the WebApi project.");
    }
}
