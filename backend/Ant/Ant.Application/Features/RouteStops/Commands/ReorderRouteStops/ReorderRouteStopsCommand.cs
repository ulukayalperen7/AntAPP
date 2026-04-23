using Ant.Application.Common.Caching;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.RouteStops.Commands.ReorderRouteStops
{
    public class ReorderRouteStopsCommand : IRequest<Response<string>>
    {
        public Guid RouteId { get; set; }
        public List<Guid> OrderedStopIds { get; set; }
    }

    public class ReorderRouteStopsCommandHandler : IRequestHandler<ReorderRouteStopsCommand, Response<string>>
    {
        private readonly IRouteSpotRepositoryAsync _routeSpotRepository;
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IMapRoutingService _mapRoutingService;
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IAppCacheService _cache;

        public ReorderRouteStopsCommandHandler(
            IRouteSpotRepositoryAsync routeSpotRepository,
            IRouteRepositoryAsync routeRepository,
            IMapRoutingService mapRoutingService,
            IAuthenticatedUserService authenticatedUser,
            IAppCacheService cache)
        {
            _routeSpotRepository = routeSpotRepository;
            _routeRepository = routeRepository;
            _mapRoutingService = mapRoutingService;
            _authenticatedUser = authenticatedUser;
            _cache = cache;
        }

        public async Task<Response<string>> Handle(ReorderRouteStopsCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var route = await _routeRepository.GetByIdAsync(request.RouteId);
            if (route == null)
                throw new ApiException("Route not found.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            if (route.AuthorUserId != userId)
                throw new ApiException("You can only reorder stops on your own routes.");

            if (request.OrderedStopIds == null || request.OrderedStopIds.Count == 0)
                throw new ApiException("Ordered stop IDs are required.");

            await _routeSpotRepository.ReorderStopsAsync(request.RouteId, request.OrderedStopIds);
            await RecomputeRouteGeometryAsync(request.RouteId, cancellationToken);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.RoutesPrefix, cancellationToken);
            return new Response<string>("ok", message: "Stops reordered.");
        }

        private async Task RecomputeRouteGeometryAsync(Guid routeId, CancellationToken cancellationToken)
        {
            var route = await _routeRepository.GetByIdAsync(routeId);
            if (route == null) return;

            var stops = await _routeSpotRepository.GetStopsForRouteAsync(routeId);
            var waypoints = stops
                .Where(rs => rs.Spot?.Location != null)
                .OrderBy(rs => rs.SpotOrder)
                .Select(rs => rs.Spot.Location)
                .ToList();

            if (waypoints.Count < 2)
            {
                route.EncodedPolyline = null;
                route.TotalDistanceMeters = 0;
                route.EstimatedDurationSeconds = 0;
                route.CenterLocation = waypoints.Count == 1 ? waypoints[0] : null;
            }
            else
            {
                var geometry = await _mapRoutingService.GetRouteGeometryAsync(waypoints, cancellationToken);
                route.EncodedPolyline = geometry.EncodedPolyline;
                route.TotalDistanceMeters = geometry.DistanceMeters;
                route.EstimatedDurationSeconds = geometry.DurationSeconds;
                route.CenterLocation = geometry.CenterPoint;
            }

            await _routeRepository.UpdateAsync(route);
        }
    }
}
