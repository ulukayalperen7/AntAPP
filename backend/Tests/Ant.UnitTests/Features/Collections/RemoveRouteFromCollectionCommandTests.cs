using Ant.Core.Entities;
using Ant.Application.Exceptions;
using Ant.Application.Features.Collections.Commands.RemoveRouteFromCollection;
using Ant.Application.Interfaces.Repositories;
using Moq;

namespace Ant.UnitTests.Features.Collections;

public class RemoveRouteFromCollectionCommandTests
{
    private readonly Mock<ICollectionRepositoryAsync> _repoMock;
    private readonly RemoveRouteFromCollectionCommandHandler _handler;

    public RemoveRouteFromCollectionCommandTests()
    {
        _repoMock = new Mock<ICollectionRepositoryAsync>();
        _handler = new RemoveRouteFromCollectionCommandHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldRemoveRoute_WhenExists()
    {
        var userId = Guid.NewGuid();
        var collectionId = Guid.NewGuid();
        var routeId = Guid.NewGuid();
        var collection = new Collection { Id = collectionId, UserId = userId };
        var collectionRoute = new CollectionRoute { CollectionId = collectionId, RouteId = routeId };

        _repoMock.Setup(r => r.GetByIdAsync(collectionId)).ReturnsAsync(collection);
        _repoMock.Setup(r => r.GetCollectionRouteAsync(collectionId, routeId)).ReturnsAsync(collectionRoute);

        var result = await _handler.Handle(new RemoveRouteFromCollectionCommand
        {
            CollectionId = collectionId,
            RouteId = routeId,
            UserId = userId
        }, CancellationToken.None);

        Assert.Equal(routeId, result);
        _repoMock.Verify(r => r.RemoveCollectionRouteAsync(collectionRoute), Times.Once);
    }

    [Fact]
    public async Task Handle_RouteNotInCollection_ThrowsApiException()
    {
        var collectionId = Guid.NewGuid();
        var collection = new Collection { Id = collectionId, UserId = Guid.NewGuid() };

        _repoMock.Setup(r => r.GetByIdAsync(collectionId)).ReturnsAsync(collection);
        _repoMock.Setup(r => r.GetCollectionRouteAsync(collectionId, It.IsAny<Guid>())).ReturnsAsync((CollectionRoute?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new RemoveRouteFromCollectionCommand
            {
                CollectionId = collectionId,
                RouteId = Guid.NewGuid()
            }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WrongOwner_ThrowsApiException()
    {
        var collectionId = Guid.NewGuid();
        var collection = new Collection { Id = collectionId, UserId = Guid.NewGuid() };

        _repoMock.Setup(r => r.GetByIdAsync(collectionId)).ReturnsAsync(collection);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new RemoveRouteFromCollectionCommand
            {
                CollectionId = collectionId,
                RouteId = Guid.NewGuid(),
                UserId = Guid.NewGuid()
            }, CancellationToken.None));
    }
}
