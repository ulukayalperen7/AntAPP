using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Enums;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Routes.Commands.ForkRoute
{
    public class ForkRouteCommand : IRequest<Response<Guid>>
    {
        public Guid OriginalRouteId { get; set; }
    }

    public class ForkRouteCommandHandler : IRequestHandler<ForkRouteCommand, Response<Guid>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public ForkRouteCommandHandler(IRouteRepositoryAsync routeRepository, IAuthenticatedUserService authenticatedUser)
        {
            _routeRepository = routeRepository;
            _authenticatedUser = authenticatedUser;
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
            return new Response<Guid>(forked.Id, message: "Route forked as draft.");
        }
    }
}
