using Ant.Core.Entities;
using Ant.Application.Exceptions;
using Ant.Application.Features.Collections.Commands.AddRouteToCollection;
using Ant.Application.Interfaces.Repositories;
using Moq;

namespace Ant.UnitTests.Features.Collections;

public class AddRouteToCollectionCommandTests
{
    private readonly Mock<ICollectionRepositoryAsync> _repoMock;
    private readonly AddRouteToCollectionCommandHandler _handler;

    public AddRouteToCollectionCommandTests()
    {
        _repoMock = new Mock<ICollectionRepositoryAsync>();
        _handler = new AddRouteToCollectionCommandHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldAddRoute_WhenNotDuplicate()
    {
        var userId = Guid.NewGuid();
        var collectionId = Guid.NewGuid();
        var routeId = Guid.NewGuid();
        var collection = new Collection { Id = collectionId, UserId = userId };

        _repoMock.Setup(r => r.GetByIdAsync(collectionId)).ReturnsAsync(collection);
        _repoMock.Setup(r => r.GetCollectionRouteAsync(collectionId, routeId)).ReturnsAsync((CollectionRoute?)null);

        var result = await _handler.Handle(new AddRouteToCollectionCommand
        {
            CollectionId = collectionId,
            RouteId = routeId,
            UserId = userId
        }, CancellationToken.None);

        Assert.Equal(routeId, result);
        _repoMock.Verify(r => r.AddCollectionRouteAsync(It.Is<CollectionRoute>(cr =>
            cr.CollectionId == collectionId && cr.RouteId == routeId
        )), Times.Once);
    }

    [Fact]
    public async Task Handle_CollectionNotFound_ThrowsApiException()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Collection?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new AddRouteToCollectionCommand
            {
                CollectionId = Guid.NewGuid(),
                RouteId = Guid.NewGuid()
            }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_DuplicateRoute_ThrowsApiException()
    {
        var collectionId = Guid.NewGuid();
        var routeId = Guid.NewGuid();
        var collection = new Collection { Id = collectionId, UserId = Guid.NewGuid() };
        var existing = new CollectionRoute { CollectionId = collectionId, RouteId = routeId };

        _repoMock.Setup(r => r.GetByIdAsync(collectionId)).ReturnsAsync(collection);
        _repoMock.Setup(r => r.GetCollectionRouteAsync(collectionId, routeId)).ReturnsAsync(existing);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new AddRouteToCollectionCommand
            {
                CollectionId = collectionId,
                RouteId = routeId
            }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WrongOwner_ThrowsApiException()
    {
        var collectionId = Guid.NewGuid();
        var collection = new Collection { Id = collectionId, UserId = Guid.NewGuid() };

        _repoMock.Setup(r => r.GetByIdAsync(collectionId)).ReturnsAsync(collection);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new AddRouteToCollectionCommand
            {
                CollectionId = collectionId,
                RouteId = Guid.NewGuid(),
                UserId = Guid.NewGuid()
            }, CancellationToken.None));
    }
}
