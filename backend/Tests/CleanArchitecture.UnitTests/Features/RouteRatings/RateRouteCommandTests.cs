using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Features.RouteRatings.Commands.RateRoute;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Interfaces.Repositories;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.UnitTests.Features.RouteRatings;

public class RateRouteCommandTests
{
    private readonly Mock<IRouteRatingRepositoryAsync> _repoMock;
    private readonly Mock<IAuthenticatedUserService> _authMock;
    private readonly RateRouteCommandHandler _handler;

    public RateRouteCommandTests()
    {
        _repoMock = new Mock<IRouteRatingRepositoryAsync>();
        _authMock = new Mock<IAuthenticatedUserService>();
        _handler = new RateRouteCommandHandler(_repoMock.Object, _authMock.Object);
    }

    [Fact]
    public async Task Handle_NewRating_CreatesAndReturnsId()
    {
        var userId = Guid.NewGuid();
        var routeId = Guid.NewGuid();
        _authMock.Setup(a => a.UserId).Returns(userId.ToString());
        _repoMock.Setup(r => r.GetByUserAndRouteAsync(userId, routeId)).ReturnsAsync((RouteRating?)null);
        _repoMock.Setup(r => r.AddAsync(It.IsAny<RouteRating>()))
            .ReturnsAsync((RouteRating r) => r);

        var result = await _handler.Handle(
            new RateRouteCommand { RouteId = routeId, Stars = 4 },
            CancellationToken.None);

        _repoMock.Verify(r => r.AddAsync(It.Is<RouteRating>(
            rr => rr.RouteId == routeId && rr.UserId == userId && rr.Stars == 4)), Times.Once);
        _repoMock.Verify(r => r.UpdateAsync(It.IsAny<RouteRating>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ExistingRating_UpdatesAndReturnsId()
    {
        var userId = Guid.NewGuid();
        var routeId = Guid.NewGuid();
        var existingId = Guid.NewGuid();
        var existing = new RouteRating { Id = existingId, UserId = userId, RouteId = routeId, Stars = 2 };

        _authMock.Setup(a => a.UserId).Returns(userId.ToString());
        _repoMock.Setup(r => r.GetByUserAndRouteAsync(userId, routeId)).ReturnsAsync(existing);

        var result = await _handler.Handle(
            new RateRouteCommand { RouteId = routeId, Stars = 5 },
            CancellationToken.None);

        Assert.Equal(existingId, result);
        Assert.Equal(5, existing.Stars);
        _repoMock.Verify(r => r.UpdateAsync(existing), Times.Once);
        _repoMock.Verify(r => r.AddAsync(It.IsAny<RouteRating>()), Times.Never);
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
}
