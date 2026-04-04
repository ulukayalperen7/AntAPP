using Ant.Core.Entities;
using Ant.Application.Exceptions;
using Ant.Application.Features.RouteRatings.Queries.GetRouteAverageRating;
using Ant.Application.Interfaces;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.UnitTests.Features.RouteRatings;

public class GetRouteAverageRatingQueryTests
{
    private readonly Mock<IGenericRepositoryAsync<Route>> _routeRepoMock;
    private readonly GetRouteAverageRatingQueryHandler _handler;

    public GetRouteAverageRatingQueryTests()
    {
        _routeRepoMock = new Mock<IGenericRepositoryAsync<Route>>();
        _handler = new GetRouteAverageRatingQueryHandler(_routeRepoMock.Object);
    }

    [Fact]
    public async Task Handle_WithRatings_ReturnsSumDividedByCount()
    {
        var routeId = Guid.NewGuid();
        var route = new Route { Id = routeId, RatingSum = 14, RatingCount = 4 };
        _routeRepoMock.Setup(r => r.GetByIdAsync(routeId)).ReturnsAsync(route);

        var result = await _handler.Handle(
            new GetRouteAverageRatingQuery { RouteId = routeId }, CancellationToken.None);

        Assert.Equal(routeId, result.RouteId);
        Assert.Equal(3.5, result.AverageStars);
        Assert.Equal(4, result.RatingCount);
    }

    [Fact]
    public async Task Handle_AllFiveStars_ReturnsFive()
    {
        var routeId = Guid.NewGuid();
        var route = new Route { Id = routeId, RatingSum = 15, RatingCount = 3 };
        _routeRepoMock.Setup(r => r.GetByIdAsync(routeId)).ReturnsAsync(route);

        var result = await _handler.Handle(
            new GetRouteAverageRatingQuery { RouteId = routeId }, CancellationToken.None);

        Assert.Equal(5.0, result.AverageStars);
    }

    [Fact]
    public async Task Handle_NoRatings_ReturnsNullAverage()
    {
        var routeId = Guid.NewGuid();
        var route = new Route { Id = routeId, RatingSum = 0, RatingCount = 0 };
        _routeRepoMock.Setup(r => r.GetByIdAsync(routeId)).ReturnsAsync(route);

        var result = await _handler.Handle(
            new GetRouteAverageRatingQuery { RouteId = routeId }, CancellationToken.None);

        Assert.Equal(routeId, result.RouteId);
        Assert.Null(result.AverageStars);
        Assert.Equal(0, result.RatingCount);
    }

    [Fact]
    public async Task Handle_RouteNotFound_ThrowsApiException()
    {
        _routeRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Route?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new GetRouteAverageRatingQuery { RouteId = Guid.NewGuid() }, CancellationToken.None));
    }
}
