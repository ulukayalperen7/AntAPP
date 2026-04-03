using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.RouteStops.Commands.ReorderRouteStops
{
    public class ReorderRouteStopsCommand : IRequest<Response<string>>
    {
        public Guid RouteId { get; set; }
        public List<Guid> OrderedStopIds { get; set; }
    }

    public class ReorderRouteStopsCommandHandler : IRequestHandler<ReorderRouteStopsCommand, Response<string>>
    {
        private readonly IRouteSpotRepositoryAsync _routeSpotRepository;
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public ReorderRouteStopsCommandHandler(
            IRouteSpotRepositoryAsync routeSpotRepository,
            IRouteRepositoryAsync routeRepository,
            IAuthenticatedUserService authenticatedUser)
        {
            _routeSpotRepository = routeSpotRepository;
            _routeRepository = routeRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Response<string>> Handle(ReorderRouteStopsCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var route = await _routeRepository.GetByIdAsync(request.RouteId);
            if (route == null)
                throw new ApiException("Route not found.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            if (route.AuthorUserId != userId)
                throw new ApiException("You can only reorder stops on your own routes.");

            if (request.OrderedStopIds == null || request.OrderedStopIds.Count == 0)
                throw new ApiException("Ordered stop IDs are required.");

            await _routeSpotRepository.ReorderStopsAsync(request.RouteId, request.OrderedStopIds);
            return new Response<string>("ok", message: "Stops reordered.");
        }
    }
}
