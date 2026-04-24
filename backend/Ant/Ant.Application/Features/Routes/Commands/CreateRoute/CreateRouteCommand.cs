using Ant.Core.Entities;
using Ant.Core.Enums;
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

namespace Ant.Application.Features.Routes.Commands.CreateRoute
{
    /// <summary>
    /// Data object representing a specific stop within the new Route.
    /// Used inside the CreateRouteCommand.
    /// </summary>
    public class CreateRouteSpotRequest
    {
        public Guid? SpotId { get; set; }
        
        // Map fields for creating a point on the fly
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string SpotName { get; set; }
        public string GooglePlaceId { get; set; }

        public string CustomTitle { get; set; }
        public string CustomDescription { get; set; }
    }

    /// <summary>
    /// Command to create a brand new Route (Journey).
    /// </summary>
    public class CreateRouteCommand : IRequest<Response<Guid>>
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
        public bool IsPublic { get; set; } = true;
        public List<Guid> TagIds { get; set; }
        
        /// <summary>
        /// The ordered list of stops. The first item in the list is the starting point (SpotOrder = 1).
        /// </summary>
        public List<CreateRouteSpotRequest> Spots { get; set; }
    }

    public class CreateRouteCommandHandler : IRequestHandler<CreateRouteCommand, Response<Guid>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly ISpotRepositoryAsync _spotRepository;
        private readonly IMapRoutingService _mapRoutingService;
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IAppCacheService _cache;

        public CreateRouteCommandHandler(
            IRouteRepositoryAsync routeRepository, 
            ISpotRepositoryAsync spotRepository,
            IMapRoutingService mapRoutingService,
            IAuthenticatedUserService authenticatedUser,
            IAppCacheService cache)
        {
            _routeRepository = routeRepository;
            _spotRepository = spotRepository;
            _mapRoutingService = mapRoutingService;
            _authenticatedUser = authenticatedUser;
            _cache = cache;
        }

        public async Task<Response<Guid>> Handle(CreateRouteCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("You must be logged in to create a route.");

            // MVP Business Rule: A route must contain at least 2 spots.
            if (request.Spots == null || request.Spots.Count < 2)
            {
                throw new ApiException("A route must contain at least 2 spots to be valid.");
            }

            var authorId = Guid.Parse(_authenticatedUser.UserId);

            // Initialize the Route entity
            var newRoute = new Route
            {
                AuthorUserId = authorId,
                Title = request.Title,
                Description = request.Description,
                ThumbnailUrl = request.ThumbnailUrl,
                RouteType = RouteTypeEnum.Walking,
                IsPublic = request.IsPublic,
                RouteTags = new List<RouteTag>(),
                RouteSpots = new List<RouteSpot>()
            };

            // Map Tags
            if (request.TagIds != null && request.TagIds.Any())
            {
                foreach (var tagId in request.TagIds)
                {
                    newRoute.RouteTags.Add(new RouteTag { TagId = tagId });
                }
            }

            // Map Spots and Enforce Order (1-based index)
            var waypoints = new List<NetTopologySuite.Geometries.Point>();

            for (int i = 0; i < request.Spots.Count; i++)
            {
                var spotItem = request.Spots[i];
                Guid finalSpotId = Guid.Empty;

                if (spotItem.SpotId.HasValue)
                {
                    finalSpotId = spotItem.SpotId.Value;
                    var existingSpot = await _spotRepository.GetByIdAsync(finalSpotId);
                    if (existingSpot != null)
                        waypoints.Add(existingSpot.Location);
                }
                else if (spotItem.Latitude.HasValue && spotItem.Longitude.HasValue)
                {
                    // Create new Spot on the fly
                    var point = new NetTopologySuite.Geometries.Point(spotItem.Longitude.Value, spotItem.Latitude.Value) { SRID = 4326 };
                    var freshSpot = new Spot
                    {
                        Name = spotItem.SpotName ?? "New Map Location",
                        Location = point,
                        GooglePlaceId = spotItem.GooglePlaceId,
                        IsActive = true
                    };
                    await _spotRepository.AddAsync(freshSpot);
                    finalSpotId = freshSpot.Id;
                    waypoints.Add(point);
                }

                if (finalSpotId != Guid.Empty)
                {
                    newRoute.RouteSpots.Add(new RouteSpot
                    {
                        SpotId = finalSpotId,
                        SpotOrder = i + 1, // Order is purely based on the list position
                        CustomTitle = spotItem.CustomTitle,
                        CustomDescription = spotItem.CustomDescription
                    });
                }
            }

            // Map Workflow: Fetch Polyline, Distance, Duration, Center
            var geometryResult = await _mapRoutingService.GetRouteGeometryAsync(waypoints, cancellationToken);
            newRoute.EncodedPolyline = geometryResult.EncodedPolyline;
            newRoute.TotalDistanceMeters = geometryResult.DistanceMeters;
            newRoute.EstimatedDurationSeconds = geometryResult.DurationSeconds;
            newRoute.CenterLocation = geometryResult.CenterPoint;

            // This command saves the Route, RouteTags, and RouteSpots in ONE transaction automatically via EF Core
            await _routeRepository.AddAsync(newRoute);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.RoutesPrefix, cancellationToken);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.SpotsPrefix, cancellationToken);

            return new Response<Guid>(newRoute.Id, message: "Route successfully created.");
        }
    }
}
