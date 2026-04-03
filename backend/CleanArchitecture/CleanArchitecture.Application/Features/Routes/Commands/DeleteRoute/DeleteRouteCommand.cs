using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Routes.Commands.DeleteRoute
{
    public class DeleteRouteCommand : IRequest<Response<Guid>>
    {
        public Guid Id { get; set; }
    }

    public class DeleteRouteCommandHandler : IRequestHandler<DeleteRouteCommand, Response<Guid>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public DeleteRouteCommandHandler(IRouteRepositoryAsync routeRepository, IAuthenticatedUserService authenticatedUser)
        {
            _routeRepository = routeRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Response<Guid>> Handle(DeleteRouteCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var route = await _routeRepository.GetRouteWithTrackingAsync(request.Id);
            if (route == null)
                throw new ApiException("Route not found.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            if (route.AuthorUserId != userId)
                throw new ApiException("You can only delete your own routes.");

            route.IsDeleted = true;
            await _routeRepository.UpdateAsync(route);
            return new Response<Guid>(route.Id, message: "Route deleted.");
        }
    }
}
