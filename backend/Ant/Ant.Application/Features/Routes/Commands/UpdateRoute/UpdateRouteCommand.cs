using Ant.Core.Entities;
using Ant.Application.Common.Caching;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Routes.Commands.UpdateRoute
{
    public class UpdateRouteCommand : IRequest<Response<Guid>>
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
        public bool? IsPublic { get; set; }
        public List<Guid> TagIds { get; set; }
    }

    public class UpdateRouteCommandHandler : IRequestHandler<UpdateRouteCommand, Response<Guid>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IAppCacheService _cache;

        public UpdateRouteCommandHandler(IRouteRepositoryAsync routeRepository, IAuthenticatedUserService authenticatedUser, IAppCacheService cache)
        {
            _routeRepository = routeRepository;
            _authenticatedUser = authenticatedUser;
            _cache = cache;
        }

        public async Task<Response<Guid>> Handle(UpdateRouteCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var route = await _routeRepository.GetRouteWithTrackingAsync(request.Id);
            if (route == null)
                throw new ApiException("Route not found.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            if (route.AuthorUserId != userId)
                throw new ApiException("You can only update your own routes.");

            if (request.Title != null) route.Title = request.Title;
            if (request.Description != null) route.Description = request.Description;
            if (request.ThumbnailUrl != null) route.ThumbnailUrl = request.ThumbnailUrl;
            if (request.IsPublic.HasValue) route.IsPublic = request.IsPublic.Value;

            // Update Tags
            if (request.TagIds != null)
            {
                route.RouteTags.Clear();
                foreach (var tagId in request.TagIds)
                {
                    route.RouteTags.Add(new RouteTag { TagId = tagId });
                }
            }
            await _routeRepository.UpdateAsync(route);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.RoutesPrefix, cancellationToken);
            return new Response<Guid>(route.Id, message: "Route updated.");
        }
    }
}
