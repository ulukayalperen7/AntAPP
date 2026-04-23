using Ant.Core.Entities;
using Ant.Application.Common.Caching;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.SpotRatings.Commands.RateSpot
{
    public class RateSpotCommand : IRequest<Guid>
    {
        public Guid SpotId { get; set; }
        public short Stars { get; set; }
        public short? Score { get; set; }
    }

    public class RateSpotCommandHandler : IRequestHandler<RateSpotCommand, Guid>
    {
        private readonly ISpotRatingRepositoryAsync _ratingRepository;
        private readonly IGenericRepositoryAsync<Spot> _spotRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IAppCacheService _cache;

        public RateSpotCommandHandler(
            ISpotRatingRepositoryAsync ratingRepository,
            IGenericRepositoryAsync<Spot> spotRepository,
            IAuthenticatedUserService authenticatedUser,
            IAppCacheService cache)
        {
            _ratingRepository = ratingRepository;
            _spotRepository = spotRepository;
            _authenticatedUser = authenticatedUser;
            _cache = cache;
        }

        public async Task<Guid> Handle(RateSpotCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var stars = request.Stars > 0 ? request.Stars : request.Score.GetValueOrDefault();

            if (stars < 1 || stars > 5)
                throw new ApiException("Stars must be between 1 and 5.");

            var userId = Guid.Parse(_authenticatedUser.UserId);

            var spot = await _spotRepository.GetByIdAsync(request.SpotId);
            if (spot == null)
                throw new ApiException("Spot not found.");

            var existing = await _ratingRepository.GetByUserAndSpotAsync(userId, request.SpotId);

            if (existing != null)
            {
                spot.RatingSum = spot.RatingSum - existing.Stars + stars;
                existing.Stars = stars;
                await _ratingRepository.UpdateAsync(existing);
                await _spotRepository.UpdateAsync(spot);
                await _cache.RemoveByPrefixAsync(AppCacheKeys.SpotsPrefix, cancellationToken);
                return existing.Id;
            }

            var rating = new SpotRating
            {
                UserId = userId,
                SpotId = request.SpotId,
                Stars = stars,
                CreatedAt = DateTime.UtcNow
            };

            spot.RatingSum += stars;
            spot.RatingCount++;

            await _ratingRepository.AddAsync(rating);
            await _spotRepository.UpdateAsync(spot);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.SpotsPrefix, cancellationToken);
            return rating.Id;
        }
    }
}
