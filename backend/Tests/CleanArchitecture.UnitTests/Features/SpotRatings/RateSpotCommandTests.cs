using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Features.SpotRatings.Commands.RateSpot;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Interfaces.Repositories;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.UnitTests.Features.SpotRatings;

public class RateSpotCommandTests
{
    private readonly Mock<ISpotRatingRepositoryAsync> _ratingRepoMock;
    private readonly Mock<IGenericRepositoryAsync<Spot>> _spotRepoMock;
    private readonly Mock<IAuthenticatedUserService> _authMock;
    private readonly RateSpotCommandHandler _handler;

    public RateSpotCommandTests()
    {
        _ratingRepoMock = new Mock<ISpotRatingRepositoryAsync>();
        _spotRepoMock = new Mock<IGenericRepositoryAsync<Spot>>();
        _authMock = new Mock<IAuthenticatedUserService>();
        _handler = new RateSpotCommandHandler(_ratingRepoMock.Object, _spotRepoMock.Object, _authMock.Object);
    }

    [Fact]
    public async Task Handle_NewRating_IncrementsCountAndAddsToSum()
    {
        var userId = Guid.NewGuid();
        var spotId = Guid.NewGuid();
        var spot = new Spot { Id = spotId, RatingSum = 5, RatingCount = 2 };

        _authMock.Setup(a => a.UserId).Returns(userId.ToString());
        _spotRepoMock.Setup(r => r.GetByIdAsync(spotId)).ReturnsAsync(spot);
        _ratingRepoMock.Setup(r => r.GetByUserAndSpotAsync(userId, spotId)).ReturnsAsync((SpotRating?)null);
        _ratingRepoMock.Setup(r => r.AddAsync(It.IsAny<SpotRating>())).ReturnsAsync((SpotRating r) => r);

        await _handler.Handle(new RateSpotCommand { SpotId = spotId, Stars = 3 }, CancellationToken.None);

        Assert.Equal(8, spot.RatingSum);
        Assert.Equal(3, spot.RatingCount);
        _ratingRepoMock.Verify(r => r.AddAsync(It.Is<SpotRating>(sr => sr.Stars == 3)), Times.Once);
        _spotRepoMock.Verify(r => r.UpdateAsync(spot), Times.Once);
    }

    [Fact]
    public async Task Handle_ExistingRating_SwapsSumWithoutChangingCount()
    {
        var userId = Guid.NewGuid();
        var spotId = Guid.NewGuid();
        var existingId = Guid.NewGuid();
        var spot = new Spot { Id = spotId, RatingSum = 9, RatingCount = 3 };
        var existing = new SpotRating { Id = existingId, UserId = userId, SpotId = spotId, Stars = 1 };

        _authMock.Setup(a => a.UserId).Returns(userId.ToString());
        _spotRepoMock.Setup(r => r.GetByIdAsync(spotId)).ReturnsAsync(spot);
        _ratingRepoMock.Setup(r => r.GetByUserAndSpotAsync(userId, spotId)).ReturnsAsync(existing);

        var result = await _handler.Handle(new RateSpotCommand { SpotId = spotId, Stars = 4 }, CancellationToken.None);

        Assert.Equal(existingId, result);
        Assert.Equal(4, existing.Stars);
        Assert.Equal(12, spot.RatingSum);
        Assert.Equal(3, spot.RatingCount);
        _ratingRepoMock.Verify(r => r.UpdateAsync(existing), Times.Once);
        _ratingRepoMock.Verify(r => r.AddAsync(It.IsAny<SpotRating>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NotAuthenticated_ThrowsApiException()
    {
        _authMock.Setup(a => a.UserId).Returns((string?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new RateSpotCommand { SpotId = Guid.NewGuid(), Stars = 3 }, CancellationToken.None));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(6)]
    public async Task Handle_InvalidStars_ThrowsApiException(short stars)
    {
        _authMock.Setup(a => a.UserId).Returns(Guid.NewGuid().ToString());

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new RateSpotCommand { SpotId = Guid.NewGuid(), Stars = stars }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_SpotNotFound_ThrowsApiException()
    {
        _authMock.Setup(a => a.UserId).Returns(Guid.NewGuid().ToString());
        _spotRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Spot?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new RateSpotCommand { SpotId = Guid.NewGuid(), Stars = 3 }, CancellationToken.None));
    }
}
