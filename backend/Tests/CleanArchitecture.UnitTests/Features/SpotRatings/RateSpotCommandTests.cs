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
    private readonly Mock<ISpotRatingRepositoryAsync> _repoMock;
    private readonly Mock<IAuthenticatedUserService> _authMock;
    private readonly RateSpotCommandHandler _handler;

    public RateSpotCommandTests()
    {
        _repoMock = new Mock<ISpotRatingRepositoryAsync>();
        _authMock = new Mock<IAuthenticatedUserService>();
        _handler = new RateSpotCommandHandler(_repoMock.Object, _authMock.Object);
    }

    [Fact]
    public async Task Handle_NewRating_CreatesAndReturnsId()
    {
        var userId = Guid.NewGuid();
        var spotId = Guid.NewGuid();
        _authMock.Setup(a => a.UserId).Returns(userId.ToString());
        _repoMock.Setup(r => r.GetByUserAndSpotAsync(userId, spotId)).ReturnsAsync((SpotRating?)null);
        _repoMock.Setup(r => r.AddAsync(It.IsAny<SpotRating>()))
            .ReturnsAsync((SpotRating r) => r);

        var result = await _handler.Handle(
            new RateSpotCommand { SpotId = spotId, Stars = 4 },
            CancellationToken.None);

        _repoMock.Verify(r => r.AddAsync(It.Is<SpotRating>(
            sr => sr.SpotId == spotId && sr.UserId == userId && sr.Stars == 4)), Times.Once);
        _repoMock.Verify(r => r.UpdateAsync(It.IsAny<SpotRating>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ExistingRating_UpdatesAndReturnsId()
    {
        var userId = Guid.NewGuid();
        var spotId = Guid.NewGuid();
        var existingId = Guid.NewGuid();
        var existing = new SpotRating { Id = existingId, UserId = userId, SpotId = spotId, Stars = 2 };

        _authMock.Setup(a => a.UserId).Returns(userId.ToString());
        _repoMock.Setup(r => r.GetByUserAndSpotAsync(userId, spotId)).ReturnsAsync(existing);

        var result = await _handler.Handle(
            new RateSpotCommand { SpotId = spotId, Stars = 5 },
            CancellationToken.None);

        Assert.Equal(existingId, result);
        Assert.Equal(5, existing.Stars);
        _repoMock.Verify(r => r.UpdateAsync(existing), Times.Once);
        _repoMock.Verify(r => r.AddAsync(It.IsAny<SpotRating>()), Times.Never);
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
}
