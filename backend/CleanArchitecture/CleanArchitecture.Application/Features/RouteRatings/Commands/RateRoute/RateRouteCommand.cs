using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.RouteRatings.Commands.RateRoute
{
    public class RateRouteCommand : IRequest<Guid>
    {
        public Guid RouteId { get; set; }
        public short Stars { get; set; }
    }

    public class RateRouteCommandHandler : IRequestHandler<RateRouteCommand, Guid>
    {
        private readonly IRouteRatingRepositoryAsync _ratingRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public RateRouteCommandHandler(
            IRouteRatingRepositoryAsync ratingRepository,
            IAuthenticatedUserService authenticatedUser)
        {
            _ratingRepository = ratingRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Guid> Handle(RateRouteCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            if (request.Stars < 1 || request.Stars > 5)
                throw new ApiException("Stars must be between 1 and 5.");

            var userId = Guid.Parse(_authenticatedUser.UserId);

            var existing = await _ratingRepository.GetByUserAndRouteAsync(userId, request.RouteId);

            if (existing != null)
            {
                existing.Stars = request.Stars;
                await _ratingRepository.UpdateAsync(existing);
                return existing.Id;
            }

            var rating = new RouteRating
            {
                UserId = userId,
                RouteId = request.RouteId,
                Stars = request.Stars,
                CreatedAt = DateTime.UtcNow
            };

            await _ratingRepository.AddAsync(rating);
            return rating.Id;
        }
    }
}
