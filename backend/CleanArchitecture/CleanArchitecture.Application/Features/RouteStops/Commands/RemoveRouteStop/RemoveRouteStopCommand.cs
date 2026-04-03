using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.RouteStops.Commands.RemoveRouteStop
{
    public class RemoveRouteStopCommand : IRequest<Response<Guid>>
    {
        public Guid RouteId { get; set; }
        public Guid RouteStopId { get; set; }
    }

    public class RemoveRouteStopCommandHandler : IRequestHandler<RemoveRouteStopCommand, Response<Guid>>
    {
        private readonly IRouteSpotRepositoryAsync _routeSpotRepository;
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public RemoveRouteStopCommandHandler(
            IRouteSpotRepositoryAsync routeSpotRepository,
            IRouteRepositoryAsync routeRepository,
            IAuthenticatedUserService authenticatedUser)
        {
            _routeSpotRepository = routeSpotRepository;
            _routeRepository = routeRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Response<Guid>> Handle(RemoveRouteStopCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var route = await _routeRepository.GetByIdAsync(request.RouteId);
            if (route == null)
                throw new ApiException("Route not found.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            if (route.AuthorUserId != userId)
                throw new ApiException("You can only remove stops from your own routes.");

            var stop = await _routeSpotRepository.GetStopWithTrackingAsync(request.RouteStopId);
            if (stop == null || stop.RouteId != request.RouteId)
                throw new ApiException("Stop not found in this route.");

            await _routeSpotRepository.DeleteAsync(stop);
            return new Response<Guid>(request.RouteStopId, message: "Stop removed from route.");
        }
    }
}
