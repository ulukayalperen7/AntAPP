using Ant.Core.Entities;
using Ant.Application.Exceptions;
using Ant.Application.Features.Collections.Commands.UnsaveRoute;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Moq;

namespace Ant.UnitTests.Features.Collections;

public class UnsaveRouteCommandTests
{
    private readonly Mock<ICollectionRepositoryAsync> _repoMock;
    private readonly Mock<IAuthenticatedUserService> _authMock;
    private readonly UnsaveRouteCommandHandler _handler;

    public UnsaveRouteCommandTests()
    {
        _repoMock = new Mock<ICollectionRepositoryAsync>();
        _authMock = new Mock<IAuthenticatedUserService>();
        _handler = new UnsaveRouteCommandHandler(_repoMock.Object, _authMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldUnsaveRoute_WhenSaved()
    {
        var userId = Guid.NewGuid();
        var routeId = Guid.NewGuid();
        var defaultCollectionId = Guid.NewGuid();
        var defaultCollection = new Collection { Id = defaultCollectionId, UserId = userId, IsDefault = true };
        var collectionRoute = new CollectionRoute { CollectionId = defaultCollectionId, RouteId = routeId };

        _authMock.Setup(a => a.UserId).Returns(userId.ToString());
        _repoMock.Setup(r => r.GetDefaultCollectionAsync(userId)).ReturnsAsync(defaultCollection);
        _repoMock.Setup(r => r.GetCollectionRouteAsync(defaultCollectionId, routeId)).ReturnsAsync(collectionRoute);

        var result = await _handler.Handle(new UnsaveRouteCommand { RouteId = routeId }, CancellationToken.None);

        Assert.Equal(routeId, result);
        _repoMock.Verify(r => r.RemoveCollectionRouteAsync(collectionRoute), Times.Once);
    }

    [Fact]
    public async Task Handle_NoDefaultCollection_ThrowsApiException()
    {
        var userId = Guid.NewGuid();
        _authMock.Setup(a => a.UserId).Returns(userId.ToString());
        _repoMock.Setup(r => r.GetDefaultCollectionAsync(userId)).ReturnsAsync((Collection?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new UnsaveRouteCommand { RouteId = Guid.NewGuid() }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_RouteNotSaved_ThrowsApiException()
    {
        var userId = Guid.NewGuid();
        var defaultCollection = new Collection { Id = Guid.NewGuid(), UserId = userId, IsDefault = true };

        _authMock.Setup(a => a.UserId).Returns(userId.ToString());
        _repoMock.Setup(r => r.GetDefaultCollectionAsync(userId)).ReturnsAsync(defaultCollection);
        _repoMock.Setup(r => r.GetCollectionRouteAsync(defaultCollection.Id, It.IsAny<Guid>())).ReturnsAsync((CollectionRoute?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new UnsaveRouteCommand { RouteId = Guid.NewGuid() }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_NotAuthenticated_ThrowsApiException()
    {
        _authMock.Setup(a => a.UserId).Returns((string?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new UnsaveRouteCommand { RouteId = Guid.NewGuid() }, CancellationToken.None));
    }
}
