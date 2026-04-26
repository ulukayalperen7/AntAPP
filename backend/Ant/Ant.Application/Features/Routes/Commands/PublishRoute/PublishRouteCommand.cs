using Ant.Application.Common.Caching;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using Ant.Core.Entities;
using MediatR;
using System;
using System.Linq;
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
        private readonly IAppCacheService _cache;

        public PublishRouteCommandHandler(IRouteRepositoryAsync routeRepository, IAuthenticatedUserService authenticatedUser, IAppCacheService cache)
        {
            _routeRepository = routeRepository;
            _authenticatedUser = authenticatedUser;
            _cache = cache;
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

            if (!route.IsPublic && route.OriginalRouteId.HasValue)
            {
                var original = await _routeRepository.GetRouteWithSpotsAsync(route.OriginalRouteId.Value);
                if (original == null)
                    throw new ApiException("Original route not found.");

                if (!HasForkChanges(route, original))
                    throw new ApiException("Edit this copy before publishing it.");
            }

            route.IsPublic = true;
            await _routeRepository.UpdateAsync(route);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.RoutesPrefix, cancellationToken);
            return new Response<Guid>(route.Id, message: "Route published.");
        }

        private static bool HasForkChanges(Route fork, Route original)
        {
            if (!string.Equals(fork.Title, original.Title, StringComparison.Ordinal)) return true;
            if (!string.Equals(fork.Description, original.Description, StringComparison.Ordinal)) return true;
            if (!string.Equals(fork.ThumbnailUrl, original.ThumbnailUrl, StringComparison.Ordinal)) return true;

            var forkTags = fork.RouteTags?.Select(rt => rt.TagId).OrderBy(id => id).ToArray() ?? Array.Empty<Guid>();
            var originalTags = original.RouteTags?.Select(rt => rt.TagId).OrderBy(id => id).ToArray() ?? Array.Empty<Guid>();
            if (!forkTags.SequenceEqual(originalTags)) return true;

            var forkStops = fork.RouteSpots?.OrderBy(rs => rs.SpotOrder).ToList() ?? [];
            var originalStops = original.RouteSpots?.OrderBy(rs => rs.SpotOrder).ToList() ?? [];
            if (forkStops.Count != originalStops.Count) return true;

            for (var i = 0; i < forkStops.Count; i++)
            {
                var left = forkStops[i];
                var right = originalStops[i];
                if (left.SpotId != right.SpotId) return true;
                if (left.SpotOrder != right.SpotOrder) return true;
                if (!string.Equals(left.CustomTitle, right.CustomTitle, StringComparison.Ordinal)) return true;
                if (!string.Equals(left.CustomDescription, right.CustomDescription, StringComparison.Ordinal)) return true;
                if (!string.Equals(left.CustomPhotoUrl, right.CustomPhotoUrl, StringComparison.Ordinal)) return true;
            }

            return false;
        }
    }
}
