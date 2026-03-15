using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.RouteRatings.Queries.GetRouteAverageRating
{
    public class GetRouteAverageRatingQuery : IRequest<GetRouteAverageRatingViewModel>
    {
        public Guid RouteId { get; set; }
    }

    public class GetRouteAverageRatingViewModel
    {
        public Guid RouteId { get; set; }
        public double? AverageStars { get; set; }
        public long RatingCount { get; set; }
    }

    public class GetRouteAverageRatingQueryHandler : IRequestHandler<GetRouteAverageRatingQuery, GetRouteAverageRatingViewModel>
    {
        private readonly IGenericRepositoryAsync<Route> _routeRepository;

        public GetRouteAverageRatingQueryHandler(IGenericRepositoryAsync<Route> routeRepository)
        {
            _routeRepository = routeRepository;
        }

        public async Task<GetRouteAverageRatingViewModel> Handle(GetRouteAverageRatingQuery request, CancellationToken cancellationToken)
        {
            var route = await _routeRepository.GetByIdAsync(request.RouteId);
            if (route == null)
                throw new ApiException("Route not found.");

            return new GetRouteAverageRatingViewModel
            {
                RouteId = route.Id,
                AverageStars = route.RatingCount > 0 ? (double)route.RatingSum / route.RatingCount : null,
                RatingCount = route.RatingCount
            };
        }
    }
}
