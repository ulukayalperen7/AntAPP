using Ant.Core.Entities;
using Ant.Application.Exceptions;
using Ant.Application.Features.Collections.Queries.GetCollectionById;
using Ant.Application.Interfaces.Repositories;
using Moq;

namespace Ant.UnitTests.Features.Collections;

public class GetCollectionByIdQueryTests
{
    private readonly Mock<ICollectionRepositoryAsync> _repoMock;
    private readonly GetCollectionByIdQueryHandler _handler;

    public GetCollectionByIdQueryTests()
    {
        _repoMock = new Mock<ICollectionRepositoryAsync>();
        _handler = new GetCollectionByIdQueryHandler(_repoMock.Object);
    }

    /*
    [Fact]
    public async Task Handle_ReturnsDetailWithRoutes()
    {
        var userId = Guid.NewGuid();
        var collectionId = Guid.NewGuid();
        var routeId = Guid.NewGuid();

        var collection = new Collection
        {
            Id = collectionId,
            UserId = userId,
            Name = "My Routes",
            IsDefault = false,
            IsPublic = true,
            Description = "Best routes",
            CollectionRoutes = new List<CollectionRoute>
            {
                new()
                {
                    CollectionId = collectionId,
                    RouteId = routeId,
                    SavedAt = DateTime.UtcNow,
                    Route = new Route { Id = routeId, Title = "Sunset Walk", ThumbnailUrl = "https://img/1.jpg" }
                }
            }
        };

        _repoMock.Setup(r => r.GetCollectionWithRoutesAsync(collectionId)).ReturnsAsync(collection);

        var result = await _handler.Handle(new GetCollectionByIdQuery
        {
            Id = collectionId,
            UserId = userId
        }, CancellationToken.None);

        Assert.Equal(collectionId, result.Id);
        Assert.Equal("My Routes", result.Name);
        Assert.Single(result.Routes);
        Assert.Equal("Sunset Walk", result.Routes[0].Title);
        Assert.Equal(routeId, result.Routes[0].RouteId);
    }
    */

    [Fact]
    public async Task Handle_CollectionNotFound_ThrowsApiException()
    {
        _repoMock.Setup(r => r.GetCollectionWithRoutesAsync(It.IsAny<Guid>())).ReturnsAsync((Collection?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new GetCollectionByIdQuery { Id = Guid.NewGuid() }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WrongOwner_ThrowsApiException()
    {
        var collectionId = Guid.NewGuid();
        var collection = new Collection
        {
            Id = collectionId,
            UserId = Guid.NewGuid(),
            CollectionRoutes = new List<CollectionRoute>()
        };

        _repoMock.Setup(r => r.GetCollectionWithRoutesAsync(collectionId)).ReturnsAsync(collection);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new GetCollectionByIdQuery
            {
                Id = collectionId,
                UserId = Guid.NewGuid()
            }, CancellationToken.None));
    }

    /*
    [Fact]
    public async Task Handle_AdminNoOwnerCheck_ReturnsCollection()
    {
        var collectionId = Guid.NewGuid();
        var collection = new Collection
        {
            Id = collectionId,
            UserId = Guid.NewGuid(),
            Name = "Someone Else",
            CollectionRoutes = new List<CollectionRoute>()
        };

        _repoMock.Setup(r => r.GetCollectionWithRoutesAsync(collectionId)).ReturnsAsync(collection);

        var result = await _handler.Handle(new GetCollectionByIdQuery
        {
            Id = collectionId,
            UserId = null
        }, CancellationToken.None);

        Assert.Equal("Someone Else", result.Name);
    }
    */
}
