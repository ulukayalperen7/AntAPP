using Ant.Core.Entities;
using Ant.Application.Common.Caching;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.RouteStops.Commands.AddRouteStop
{
    public class AddRouteStopCommand : IRequest<Response<Guid>>
    {
        public Guid RouteId { get; set; }
        public Guid SpotId { get; set; }
        public string CustomTitle { get; set; }
        public string CustomDescription { get; set; }
        public int? Order { get; set; }
    }

    public class AddRouteStopCommandHandler : IRequestHandler<AddRouteStopCommand, Response<Guid>>
    {
        private readonly IRouteSpotRepositoryAsync _routeSpotRepository;
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IMapRoutingService _mapRoutingService;
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IAppCacheService _cache;

        public AddRouteStopCommandHandler(
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

        public async Task<Response<Guid>> Handle(AddRouteStopCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var route = await _routeRepository.GetByIdAsync(request.RouteId);
            if (route == null)
                throw new ApiException("Route not found.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            if (route.AuthorUserId != userId)
                throw new ApiException("You can only add stops to your own routes.");

            var order = request.Order ?? (await _routeSpotRepository.GetMaxOrderForRouteAsync(request.RouteId) + 1);

            var routeSpot = new RouteSpot
            {
                RouteId = request.RouteId,
                SpotId = request.SpotId,
                SpotOrder = order,
                CustomTitle = request.CustomTitle,
                CustomDescription = request.CustomDescription
            };

            await _routeSpotRepository.AddAsync(routeSpot);
            await RecomputeRouteGeometryAsync(request.RouteId, cancellationToken);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.RoutesPrefix, cancellationToken);
            return new Response<Guid>(routeSpot.Id, message: "Stop added to route.");
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
