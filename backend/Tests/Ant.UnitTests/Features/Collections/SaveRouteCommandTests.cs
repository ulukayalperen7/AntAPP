using Ant.Core.Entities;
using Ant.Application.Exceptions;
using Ant.Application.Features.Collections.Commands.SaveRoute;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Moq;

namespace Ant.UnitTests.Features.Collections;

public class SaveRouteCommandTests
{
    private readonly Mock<ICollectionRepositoryAsync> _repoMock;
    private readonly Mock<IAuthenticatedUserService> _authMock;
    private readonly SaveRouteCommandHandler _handler;

    public SaveRouteCommandTests()
    {
        _repoMock = new Mock<ICollectionRepositoryAsync>();
        _authMock = new Mock<IAuthenticatedUserService>();
        _handler = new SaveRouteCommandHandler(_repoMock.Object, _authMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldSaveToDefaultCollection()
    {
        var userId = Guid.NewGuid();
        var routeId = Guid.NewGuid();
        var defaultCollectionId = Guid.NewGuid();
        var defaultCollection = new Collection { Id = defaultCollectionId, UserId = userId, IsDefault = true };

        _authMock.Setup(a => a.UserId).Returns(userId.ToString());
        _repoMock.Setup(r => r.GetOrCreateDefaultCollectionAsync(userId)).ReturnsAsync(defaultCollection);
        _repoMock.Setup(r => r.GetCollectionRouteAsync(defaultCollectionId, routeId)).ReturnsAsync((CollectionRoute?)null);

        var result = await _handler.Handle(new SaveRouteCommand { RouteId = routeId }, CancellationToken.None);

        Assert.Equal(defaultCollectionId, result);
        _repoMock.Verify(r => r.AddCollectionRouteAsync(It.Is<CollectionRoute>(cr =>
            cr.CollectionId == defaultCollectionId && cr.RouteId == routeId
        )), Times.Once);
    }

    [Fact]
    public async Task Handle_RouteAlreadySaved_ThrowsApiException()
    {
        var userId = Guid.NewGuid();
        var routeId = Guid.NewGuid();
        var defaultCollectionId = Guid.NewGuid();
        var defaultCollection = new Collection { Id = defaultCollectionId, UserId = userId, IsDefault = true };
        var existing = new CollectionRoute { CollectionId = defaultCollectionId, RouteId = routeId };

        _authMock.Setup(a => a.UserId).Returns(userId.ToString());
        _repoMock.Setup(r => r.GetOrCreateDefaultCollectionAsync(userId)).ReturnsAsync(defaultCollection);
        _repoMock.Setup(r => r.GetCollectionRouteAsync(defaultCollectionId, routeId)).ReturnsAsync(existing);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new SaveRouteCommand { RouteId = routeId }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_NotAuthenticated_ThrowsApiException()
    {
        _authMock.Setup(a => a.UserId).Returns((string?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new SaveRouteCommand { RouteId = Guid.NewGuid() }, CancellationToken.None));
    }
}
