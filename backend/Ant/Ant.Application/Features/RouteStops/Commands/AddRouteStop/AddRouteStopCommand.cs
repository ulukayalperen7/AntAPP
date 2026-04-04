using Ant.Core.Entities;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
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
        private readonly IAuthenticatedUserService _authenticatedUser;

        public AddRouteStopCommandHandler(
            IRouteSpotRepositoryAsync routeSpotRepository,
            IRouteRepositoryAsync routeRepository,
            IAuthenticatedUserService authenticatedUser)
        {
            _routeSpotRepository = routeSpotRepository;
            _routeRepository = routeRepository;
            _authenticatedUser = authenticatedUser;
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
            return new Response<Guid>(routeSpot.Id, message: "Stop added to route.");
        }
    }
}
