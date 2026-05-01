using Ant.Application.Common.Caching;
using Ant.Application.DTOs;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Routes.Commands.RedrawRoute
{
    public class RedrawRouteCommand : IRequest<Response<RouteGeometryResult>>
    {
        public Guid Id { get; set; }
    }

    public class RedrawRouteCommandHandler : IRequestHandler<RedrawRouteCommand, Response<RouteGeometryResult>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IMapRoutingService _mapRoutingService;
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IAppCacheService _cache;

        public RedrawRouteCommandHandler(
            IRouteRepositoryAsync routeRepository,
            IMapRoutingService mapRoutingService,
            IAuthenticatedUserService authenticatedUser,
            IAppCacheService cache)
        {
            _routeRepository = routeRepository;
            _mapRoutingService = mapRoutingService;
            _authenticatedUser = authenticatedUser;
            _cache = cache;
        }

        public async Task<Response<RouteGeometryResult>> Handle(RedrawRouteCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var route = await _routeRepository.GetRouteWithSpotsAsync(request.Id);
            if (route == null)
                throw new ApiException("Route not found.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            if (route.AuthorUserId != userId)
                throw new ApiException("You can only redraw your own routes.");

            var waypoints = route.RouteSpots
                .OrderBy(rs => rs.SpotOrder)
                .Select(rs => rs.Spot.Location)
                .ToList();

            if (waypoints.Count < 2)
                throw new ApiException("Route must have at least 2 spots to redraw.");

            var geometryResult = await _mapRoutingService.GetRouteGeometryAsync(waypoints, cancellationToken);
            
            if (geometryResult == null)
                throw new ApiException("Failed to get route geometry from routing service.");

            // Update route geometry data
            route.EncodedPolyline = geometryResult.EncodedPolyline;
            route.TotalDistanceMeters = geometryResult.DistanceMeters;
            route.EstimatedDurationSeconds = geometryResult.DurationSeconds;
            route.CenterLocation = geometryResult.CenterPoint;
            route.UpdatedAt = DateTime.UtcNow;

            await _routeRepository.UpdateAsync(route);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.RoutesPrefix, cancellationToken);

            return new Response<RouteGeometryResult>(geometryResult, "Route redrawn successfully.");
        }
    }
}
