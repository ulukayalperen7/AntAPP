using CleanArchitecture.Core.Features.RouteRatings.Queries.GetRouteAverageRating;
using CleanArchitecture.Core.Interfaces.Repositories;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.UnitTests.Features.RouteRatings;

public class GetRouteAverageRatingQueryTests
{
    private readonly Mock<IRouteRatingRepositoryAsync> _repoMock;
    private readonly GetRouteAverageRatingQueryHandler _handler;

    public GetRouteAverageRatingQueryTests()
    {
        _repoMock = new Mock<IRouteRatingRepositoryAsync>();
        _handler = new GetRouteAverageRatingQueryHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_WithRatings_ReturnsAverage()
    {
        var routeId = Guid.NewGuid();
        _repoMock.Setup(r => r.GetAverageStarsAsync(routeId)).ReturnsAsync(3.75);

        var result = await _handler.Handle(
            new GetRouteAverageRatingQuery { RouteId = routeId },
            CancellationToken.None);

        Assert.Equal(routeId, result.RouteId);
        Assert.Equal(3.75, result.AverageStars);
    }

    [Fact]
    public async Task Handle_NoRatings_ReturnsNull()
    {
        var routeId = Guid.NewGuid();
        _repoMock.Setup(r => r.GetAverageStarsAsync(routeId)).ReturnsAsync((double?)null);

        var result = await _handler.Handle(
            new GetRouteAverageRatingQuery { RouteId = routeId },
            CancellationToken.None);

        Assert.Equal(routeId, result.RouteId);
        Assert.Null(result.AverageStars);
    }
}
