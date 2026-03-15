using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.SpotRatings.Commands.RateSpot
{
    public class RateSpotCommand : IRequest<Guid>
    {
        public Guid SpotId { get; set; }
        public short Stars { get; set; }
    }

    public class RateSpotCommandHandler : IRequestHandler<RateSpotCommand, Guid>
    {
        private readonly ISpotRatingRepositoryAsync _ratingRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public RateSpotCommandHandler(
            ISpotRatingRepositoryAsync ratingRepository,
            IAuthenticatedUserService authenticatedUser)
        {
            _ratingRepository = ratingRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Guid> Handle(RateSpotCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            if (request.Stars < 1 || request.Stars > 5)
                throw new ApiException("Stars must be between 1 and 5.");

            var userId = Guid.Parse(_authenticatedUser.UserId);

            var existing = await _ratingRepository.GetByUserAndSpotAsync(userId, request.SpotId);

            if (existing != null)
            {
                existing.Stars = request.Stars;
                await _ratingRepository.UpdateAsync(existing);
                return existing.Id;
            }

            var rating = new SpotRating
            {
                UserId = userId,
                SpotId = request.SpotId,
                Stars = request.Stars,
                CreatedAt = DateTime.UtcNow
            };

            await _ratingRepository.AddAsync(rating);
            return rating.Id;
        }
    }
}
