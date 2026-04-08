using Ant.Application.Exceptions;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Routes.Commands.PromoteRoute
{
    public class PromoteRouteCommandHandler : IRequestHandler<PromoteRouteCommand, Response<Guid>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;

        public PromoteRouteCommandHandler(IRouteRepositoryAsync routeRepository)
        {
            _routeRepository = routeRepository;
        }

        public async Task<Response<Guid>> Handle(PromoteRouteCommand request, CancellationToken cancellationToken)
        {
            var route = await _routeRepository.GetByIdAsync(request.Id);

            if (route == null)
                throw new ApiException($"Route Not Found.");

            route.ContentType = request.NewType;
            await _routeRepository.UpdateAsync(route);

            return new Response<Guid>(route.Id, message: $"Route successfully promoted to {request.NewType}.");
        }
    }
}
