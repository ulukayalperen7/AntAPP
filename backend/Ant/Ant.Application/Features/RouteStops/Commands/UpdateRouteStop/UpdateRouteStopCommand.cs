using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.RouteStops.Commands.UpdateRouteStop
{
    public class UpdateRouteStopCommand : IRequest<Response<Guid>>
    {
        public Guid RouteId { get; set; }
        public Guid RouteStopId { get; set; }
        public string CustomTitle { get; set; }
        public string CustomDescription { get; set; }
        public string CustomPhotoUrl { get; set; }
    }

    public class UpdateRouteStopCommandHandler : IRequestHandler<UpdateRouteStopCommand, Response<Guid>>
    {
        private readonly IRouteSpotRepositoryAsync _routeSpotRepository;
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public UpdateRouteStopCommandHandler(
            IRouteSpotRepositoryAsync routeSpotRepository,
            IRouteRepositoryAsync routeRepository,
            IAuthenticatedUserService authenticatedUser)
        {
            _routeSpotRepository = routeSpotRepository;
            _routeRepository = routeRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Response<Guid>> Handle(UpdateRouteStopCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var route = await _routeRepository.GetByIdAsync(request.RouteId);
            if (route == null)
                throw new ApiException("Route not found.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            if (route.AuthorUserId != userId)
                throw new ApiException("You can only update stops on your own routes.");

            var stop = await _routeSpotRepository.GetStopWithTrackingAsync(request.RouteStopId);
            if (stop == null || stop.RouteId != request.RouteId)
                throw new ApiException("Stop not found in this route.");

            if (request.CustomTitle != null) stop.CustomTitle = request.CustomTitle;
            if (request.CustomDescription != null) stop.CustomDescription = request.CustomDescription;
            if (request.CustomPhotoUrl != null) stop.CustomPhotoUrl = request.CustomPhotoUrl;

            await _routeSpotRepository.UpdateAsync(stop);
            return new Response<Guid>(stop.Id, message: "Stop updated.");
        }
    }
}
