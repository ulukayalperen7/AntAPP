using Ant.Core.Entities;
using Ant.Application.Exceptions;
using Ant.Application.Features.RouteRatings.Commands.RateRoute;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.UnitTests.Features.RouteRatings;

public class RateRouteCommandTests
{
    private readonly Mock<IRouteRatingRepositoryAsync> _ratingRepoMock;
    private readonly Mock<IGenericRepositoryAsync<Route>> _routeRepoMock;
    private readonly Mock<IAuthenticatedUserService> _authMock;
    private readonly RateRouteCommandHandler _handler;

    public RateRouteCommandTests()
    {
        _ratingRepoMock = new Mock<IRouteRatingRepositoryAsync>();
        _routeRepoMock = new Mock<IGenericRepositoryAsync<Route>>();
        _authMock = new Mock<IAuthenticatedUserService>();
        _handler = new RateRouteCommandHandler(_ratingRepoMock.Object, _routeRepoMock.Object, _authMock.Object);
    }

    [Fact]
    public async Task Handle_NewRating_IncrementsCountAndAddsToSum()
    {
        var userId = Guid.NewGuid();
        var routeId = Guid.NewGuid();
        var route = new Route { Id = routeId, RatingSum = 7, RatingCount = 2 };

        _authMock.Setup(a => a.UserId).Returns(userId.ToString());
        _routeRepoMock.Setup(r => r.GetByIdAsync(routeId)).ReturnsAsync(route);
        _ratingRepoMock.Setup(r => r.GetByUserAndRouteAsync(userId, routeId)).ReturnsAsync((RouteRating?)null);
        _ratingRepoMock.Setup(r => r.AddAsync(It.IsAny<RouteRating>())).ReturnsAsync((RouteRating r) => r);

        await _handler.Handle(new RateRouteCommand { RouteId = routeId, Stars = 4 }, CancellationToken.None);

        Assert.Equal(11, route.RatingSum);
        Assert.Equal(3, route.RatingCount);
        _ratingRepoMock.Verify(r => r.AddAsync(It.Is<RouteRating>(rr => rr.Stars == 4)), Times.Once);
        _routeRepoMock.Verify(r => r.UpdateAsync(route), Times.Once);
    }

    [Fact]
    public async Task Handle_ExistingRating_SwapsSumWithoutChangingCount()
    {
        var userId = Guid.NewGuid();
        var routeId = Guid.NewGuid();
        var existingId = Guid.NewGuid();
        var route = new Route { Id = routeId, RatingSum = 10, RatingCount = 3 };
        var existing = new RouteRating { Id = existingId, UserId = userId, RouteId = routeId, Stars = 2 };

        _authMock.Setup(a => a.UserId).Returns(userId.ToString());
        _routeRepoMock.Setup(r => r.GetByIdAsync(routeId)).ReturnsAsync(route);
        _ratingRepoMock.Setup(r => r.GetByUserAndRouteAsync(userId, routeId)).ReturnsAsync(existing);

        var result = await _handler.Handle(new RateRouteCommand { RouteId = routeId, Stars = 5 }, CancellationToken.None);

        Assert.Equal(existingId, result);
        Assert.Equal(5, existing.Stars);
        Assert.Equal(13, route.RatingSum);
        Assert.Equal(3, route.RatingCount);
        _ratingRepoMock.Verify(r => r.UpdateAsync(existing), Times.Once);
        _ratingRepoMock.Verify(r => r.AddAsync(It.IsAny<RouteRating>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NotAuthenticated_ThrowsApiException()
    {
        _authMock.Setup(a => a.UserId).Returns((string?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new RateRouteCommand { RouteId = Guid.NewGuid(), Stars = 3 }, CancellationToken.None));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(6)]
    public async Task Handle_InvalidStars_ThrowsApiException(short stars)
    {
        _authMock.Setup(a => a.UserId).Returns(Guid.NewGuid().ToString());

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new RateRouteCommand { RouteId = Guid.NewGuid(), Stars = stars }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_RouteNotFound_ThrowsApiException()
    {
        _authMock.Setup(a => a.UserId).Returns(Guid.NewGuid().ToString());
        _routeRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Route?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new RateRouteCommand { RouteId = Guid.NewGuid(), Stars = 3 }, CancellationToken.None));
    }
}
