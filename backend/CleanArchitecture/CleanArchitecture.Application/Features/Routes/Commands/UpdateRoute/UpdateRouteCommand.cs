using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Routes.Commands.UpdateRoute
{
    public class UpdateRouteCommand : IRequest<Response<Guid>>
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
        public List<Guid> CategoryTagIds { get; set; }
    }

    public class UpdateRouteCommandHandler : IRequestHandler<UpdateRouteCommand, Response<Guid>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public UpdateRouteCommandHandler(IRouteRepositoryAsync routeRepository, IAuthenticatedUserService authenticatedUser)
        {
            _routeRepository = routeRepository;
            _authenticatedUser = authenticatedUser;
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

            if (request.CategoryTagIds != null)
            {
                route.RouteTags.Clear();
                foreach (var tagId in request.CategoryTagIds)
                    route.RouteTags.Add(new Entities.RouteTag { RouteId = route.Id, TagId = tagId });
            }

            await _routeRepository.UpdateAsync(route);
            return new Response<Guid>(route.Id, message: "Route updated.");
        }
    }
}
