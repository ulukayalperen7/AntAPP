using Ant.Core.Entities;
using Ant.Application.Common.Caching;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.RouteRatings.Commands.RateRoute
{
    public class RateRouteCommand : IRequest<Response<RouteRatingResultViewModel>>
    {
        public Guid RouteId { get; set; }
        public short Stars { get; set; }
        public short? Score { get; set; }
    }

    public class RouteRatingResultViewModel
    {
        public Guid RatingId { get; set; }
        public Guid RouteId { get; set; }
        public short CurrentUserRating { get; set; }
        public double AverageRating { get; set; }
        public long RatingCount { get; set; }
    }

    public class RateRouteCommandHandler : IRequestHandler<RateRouteCommand, Response<RouteRatingResultViewModel>>
    {
        private readonly IRouteRatingRepositoryAsync _ratingRepository;
        private readonly IGenericRepositoryAsync<Route> _routeRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IAppCacheService _cache;

        public RateRouteCommandHandler(
            IRouteRatingRepositoryAsync ratingRepository,
            IGenericRepositoryAsync<Route> routeRepository,
            IAuthenticatedUserService authenticatedUser,
            IAppCacheService cache)
        {
            _ratingRepository = ratingRepository;
            _routeRepository = routeRepository;
            _authenticatedUser = authenticatedUser;
            _cache = cache;
        }

        public async Task<Response<RouteRatingResultViewModel>> Handle(RateRouteCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var stars = request.Stars > 0 ? request.Stars : request.Score.GetValueOrDefault();

            if (stars < 1 || stars > 5)
                throw new ApiException("Stars must be between 1 and 5.");

            var userId = Guid.Parse(_authenticatedUser.UserId);

            var route = await _routeRepository.GetByIdAsync(request.RouteId);
            if (route == null)
                throw new ApiException("Route not found.");

            var existing = await _ratingRepository.GetByUserAndRouteAsync(userId, request.RouteId);

            if (existing != null)
            {
                route.RatingSum = route.RatingSum - existing.Stars + stars;
                existing.Stars = stars;
                await _ratingRepository.UpdateAsync(existing);
                await _routeRepository.UpdateAsync(route);
                await _cache.RemoveByPrefixAsync(AppCacheKeys.RoutesPrefix, cancellationToken);
                return new Response<RouteRatingResultViewModel>(ToResult(existing.Id, route, stars));
            }

            var rating = new RouteRating
            {
                UserId = userId,
                RouteId = request.RouteId,
                Stars = stars,
                CreatedAt = DateTime.UtcNow
            };

            route.RatingSum += stars;
            route.RatingCount++;

            await _ratingRepository.AddAsync(rating);
            await _routeRepository.UpdateAsync(route);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.RoutesPrefix, cancellationToken);
            return new Response<RouteRatingResultViewModel>(ToResult(rating.Id, route, stars));
        }

        private static RouteRatingResultViewModel ToResult(Guid ratingId, Route route, short currentUserRating)
        {
            return new RouteRatingResultViewModel
            {
                RatingId = ratingId,
                RouteId = route.Id,
                CurrentUserRating = currentUserRating,
                AverageRating = route.RatingCount == 0 ? 0 : Math.Round(route.RatingSum / (double)route.RatingCount, 1),
                RatingCount = route.RatingCount
            };
        }
    }
}
