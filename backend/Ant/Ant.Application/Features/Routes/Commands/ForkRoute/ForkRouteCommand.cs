using Ant.Core.Entities;
using Ant.Core.Enums;
using Ant.Application.Common.Caching;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Routes.Commands.ForkRoute
{
    public class ForkRouteCommand : IRequest<Response<Guid>>
    {
        public Guid OriginalRouteId { get; set; }
    }

    public class ForkRouteCommandHandler : IRequestHandler<ForkRouteCommand, Response<Guid>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IAppCacheService _cache;

        public ForkRouteCommandHandler(IRouteRepositoryAsync routeRepository, IAuthenticatedUserService authenticatedUser, IAppCacheService cache)
        {
            _routeRepository = routeRepository;
            _authenticatedUser = authenticatedUser;
            _cache = cache;
        }

        public async Task<Response<Guid>> Handle(ForkRouteCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var original = await _routeRepository.GetRouteWithSpotsAsync(request.OriginalRouteId);
            if (original == null)
                throw new ApiException("Original route not found.");

            var userId = Guid.Parse(_authenticatedUser.UserId);

            var forked = new Route
            {
                AuthorUserId = userId,
                OriginalRouteId = original.Id,
                Title = original.Title,
                Description = original.Description,
                ThumbnailUrl = original.ThumbnailUrl,
                RouteType = original.RouteType,
                ContentType = RouteContentTypeEnum.Community,
                IsPublic = false,
                RouteTags = original.RouteTags?.Select(rt => new RouteTag { TagId = rt.TagId }).ToList() ?? new List<RouteTag>(),
                RouteSpots = original.RouteSpots?.OrderBy(rs => rs.SpotOrder).Select((rs, i) => new RouteSpot
                {
                    SpotId = rs.SpotId,
                    SpotOrder = i + 1,
                    CustomTitle = rs.CustomTitle,
                    CustomDescription = rs.CustomDescription,
                    CustomPhotoUrl = rs.CustomPhotoUrl
                }).ToList() ?? new List<RouteSpot>()
            };

            await _routeRepository.AddAsync(forked);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.RoutesPrefix, cancellationToken);
            return new Response<Guid>(forked.Id, message: "Route forked as draft.");
        }
    }
}
