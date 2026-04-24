using Ant.Application.Common.Caching;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Routes.Commands.AdminDeleteRoute
{
    public class AdminDeleteRouteCommand : IRequest<Response<Guid>>
    {
        public Guid Id { get; set; }
    }

    public class AdminDeleteRouteCommandHandler : IRequestHandler<AdminDeleteRouteCommand, Response<Guid>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAppCacheService _cache;

        public AdminDeleteRouteCommandHandler(IRouteRepositoryAsync routeRepository, IAppCacheService cache)
        {
            _routeRepository = routeRepository;
            _cache = cache;
        }

        public async Task<Response<Guid>> Handle(AdminDeleteRouteCommand request, CancellationToken cancellationToken)
        {
            var route = await _routeRepository.GetRouteWithTrackingAsync(request.Id);
            if (route == null)
                throw new ApiException("Route not found.");

            if (route.IsDeleted)
                return new Response<Guid>(route.Id, message: "Route already deleted.");

            route.IsDeleted = true;
            await _routeRepository.UpdateAsync(route);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.RoutesPrefix, cancellationToken);

            return new Response<Guid>(route.Id, message: "Route deleted by admin.");
        }
    }
}
