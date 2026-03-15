using CleanArchitecture.Core.Features.SpotRatings.Queries.GetSpotAverageRating;
using CleanArchitecture.Core.Interfaces.Repositories;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.UnitTests.Features.SpotRatings;

public class GetSpotAverageRatingQueryTests
{
    private readonly Mock<ISpotRatingRepositoryAsync> _repoMock;
    private readonly GetSpotAverageRatingQueryHandler _handler;

    public GetSpotAverageRatingQueryTests()
    {
        _repoMock = new Mock<ISpotRatingRepositoryAsync>();
        _handler = new GetSpotAverageRatingQueryHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_WithRatings_ReturnsAverage()
    {
        var spotId = Guid.NewGuid();
        _repoMock.Setup(r => r.GetAverageStarsAsync(spotId)).ReturnsAsync(4.25);

        var result = await _handler.Handle(
            new GetSpotAverageRatingQuery { SpotId = spotId },
            CancellationToken.None);

        Assert.Equal(spotId, result.SpotId);
        Assert.Equal(4.25, result.AverageStars);
    }

    [Fact]
    public async Task Handle_NoRatings_ReturnsNull()
    {
        var spotId = Guid.NewGuid();
        _repoMock.Setup(r => r.GetAverageStarsAsync(spotId)).ReturnsAsync((double?)null);

        var result = await _handler.Handle(
            new GetSpotAverageRatingQuery { SpotId = spotId },
            CancellationToken.None);

        Assert.Equal(spotId, result.SpotId);
        Assert.Null(result.AverageStars);
    }
}
