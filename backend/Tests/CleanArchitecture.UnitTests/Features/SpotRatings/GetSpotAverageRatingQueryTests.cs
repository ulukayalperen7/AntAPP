using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Features.SpotRatings.Queries.GetSpotAverageRating;
using CleanArchitecture.Core.Interfaces;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.UnitTests.Features.SpotRatings;

public class GetSpotAverageRatingQueryTests
{
    private readonly Mock<IGenericRepositoryAsync<Spot>> _spotRepoMock;
    private readonly GetSpotAverageRatingQueryHandler _handler;

    public GetSpotAverageRatingQueryTests()
    {
        _spotRepoMock = new Mock<IGenericRepositoryAsync<Spot>>();
        _handler = new GetSpotAverageRatingQueryHandler(_spotRepoMock.Object);
    }

    [Fact]
    public async Task Handle_WithRatings_ReturnsSumDividedByCount()
    {
        var spotId = Guid.NewGuid();
        var spot = new Spot { Id = spotId, RatingSum = 15, RatingCount = 5 };
        _spotRepoMock.Setup(r => r.GetByIdAsync(spotId)).ReturnsAsync(spot);

        var result = await _handler.Handle(
            new GetSpotAverageRatingQuery { SpotId = spotId }, CancellationToken.None);

        Assert.Equal(spotId, result.SpotId);
        Assert.Equal(3.0, result.AverageStars);
        Assert.Equal(5, result.RatingCount);
    }

    [Fact]
    public async Task Handle_AllOneStars_ReturnsOne()
    {
        var spotId = Guid.NewGuid();
        var spot = new Spot { Id = spotId, RatingSum = 3, RatingCount = 3 };
        _spotRepoMock.Setup(r => r.GetByIdAsync(spotId)).ReturnsAsync(spot);

        var result = await _handler.Handle(
            new GetSpotAverageRatingQuery { SpotId = spotId }, CancellationToken.None);

        Assert.Equal(1.0, result.AverageStars);
    }

    [Fact]
    public async Task Handle_NoRatings_ReturnsNullAverage()
    {
        var spotId = Guid.NewGuid();
        var spot = new Spot { Id = spotId, RatingSum = 0, RatingCount = 0 };
        _spotRepoMock.Setup(r => r.GetByIdAsync(spotId)).ReturnsAsync(spot);

        var result = await _handler.Handle(
            new GetSpotAverageRatingQuery { SpotId = spotId }, CancellationToken.None);

        Assert.Equal(spotId, result.SpotId);
        Assert.Null(result.AverageStars);
        Assert.Equal(0, result.RatingCount);
    }

    [Fact]
    public async Task Handle_SpotNotFound_ThrowsApiException()
    {
        _spotRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Spot?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new GetSpotAverageRatingQuery { SpotId = Guid.NewGuid() }, CancellationToken.None));
    }
}
