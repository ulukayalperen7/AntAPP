using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Routes.Commands.PublishRoute
{
    public class PublishRouteCommand : IRequest<Response<Guid>>
    {
        public Guid Id { get; set; }
    }

    public class PublishRouteCommandHandler : IRequestHandler<PublishRouteCommand, Response<Guid>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public PublishRouteCommandHandler(IRouteRepositoryAsync routeRepository, IAuthenticatedUserService authenticatedUser)
        {
            _routeRepository = routeRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Response<Guid>> Handle(PublishRouteCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var route = await _routeRepository.GetRouteWithTrackingAsync(request.Id);
            if (route == null)
                throw new ApiException("Route not found.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            if (route.AuthorUserId != userId)
                throw new ApiException("You can only publish your own routes.");

            route.IsPublic = true;
            await _routeRepository.UpdateAsync(route);
            return new Response<Guid>(route.Id, message: "Route published.");
        }
    }
}
