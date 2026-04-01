using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Enums;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Routes.Commands.CreateRoute
{
    /// <summary>
    /// Data object representing a specific stop within the new Route.
    /// Used inside the CreateRouteCommand.
    /// </summary>
    public class CreateRouteSpotRequest
    {
        public Guid SpotId { get; set; }
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
        public List<Guid> CategoryTagIds { get; set; }
        
        /// <summary>
        /// The ordered list of stops. The first item in the list is the starting point (SpotOrder = 1).
        /// </summary>
        public List<CreateRouteSpotRequest> Spots { get; set; }
    }

    public class CreateRouteCommandHandler : IRequestHandler<CreateRouteCommand, Response<Guid>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public CreateRouteCommandHandler(IRouteRepositoryAsync routeRepository, IAuthenticatedUserService authenticatedUser)
        {
            _routeRepository = routeRepository;
            _authenticatedUser = authenticatedUser;
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
                RouteType = RouteTypeEnum.Community,
                IsPublic = true,
                RouteTags = new List<RouteTag>(),
                RouteSpots = new List<RouteSpot>()
            };

            // Map Tags
            if (request.CategoryTagIds != null && request.CategoryTagIds.Any())
            {
                foreach (var tagId in request.CategoryTagIds)
                {
                    newRoute.RouteTags.Add(new RouteTag { TagId = tagId });
                }
            }

            // Map Spots and Enforce Order (1-based index)
            for (int i = 0; i < request.Spots.Count; i++)
            {
                var spotItem = request.Spots[i];
                newRoute.RouteSpots.Add(new RouteSpot
                {
                    SpotId = spotItem.SpotId,
                    SpotOrder = i + 1, // Order is purely based on the list position
                    CustomTitle = spotItem.CustomTitle,
                    CustomDescription = spotItem.CustomDescription
                });
            }

            // This command saves the Route, RouteTags, and RouteSpots in ONE transaction automatically via EF Core
            await _routeRepository.AddAsync(newRoute);

            return new Response<Guid>(newRoute.Id, message: "Route successfully created.");
        }
    }
}
