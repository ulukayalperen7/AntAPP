using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.RouteRatings.Queries.GetRouteRatings
{
    public class GetRouteRatingsQuery : IRequest<Response<RouteRatingSummaryViewModel>>
    {
        public Guid RouteId { get; set; }
    }

    public class RouteRatingSummaryViewModel
    {
        public double AverageRating { get; set; }
        public long TotalRatings { get; set; }
    }

    public class GetRouteRatingsQueryHandler : IRequestHandler<GetRouteRatingsQuery, Response<RouteRatingSummaryViewModel>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;

        public GetRouteRatingsQueryHandler(IRouteRepositoryAsync routeRepository)
        {
            _routeRepository = routeRepository;
        }

        public async Task<Response<RouteRatingSummaryViewModel>> Handle(GetRouteRatingsQuery request, CancellationToken cancellationToken)
        {
            var route = await _routeRepository.GetByIdAsync(request.RouteId);
            if (route == null)
                throw new Ant.Application.Exceptions.ApiException("Route not found.");

            var viewModel = new RouteRatingSummaryViewModel
            {
                AverageRating = route.RatingCount == 0 ? 0 : Math.Round(route.RatingSum / (double)route.RatingCount, 1),
                TotalRatings = route.RatingCount
            };

            return new Response<RouteRatingSummaryViewModel>(viewModel);
        }
    }
}
