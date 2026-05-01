using Ant.Application.DTOs;
using Ant.Application.Features.Routes.Commands.CreateRoute;
using Ant.Application.Features.Routes.Commands.DeleteRoute;
using Ant.Application.Features.Routes.Commands.ForkRoute;
using Ant.Application.Features.Routes.Commands.PublishRoute;
using Ant.Application.Features.Routes.Commands.UnpublishRoute;
using Ant.Application.Features.Routes.Commands.UpdateRoute;
using Ant.Application.Features.Routes.Commands.RedrawRoute;
using Ant.Application.Features.Routes.Queries.GetPagedRoutes;
using Ant.Application.Features.Routes.Queries.GetRouteById;
using Ant.Application.Features.RouteRatings.Commands.RateRoute;
using Ant.Application.Features.RouteRatings.Queries.GetRouteRatings;
using Ant.Application.Wrappers;
using Ant.Core.Enums;
using Ant.WebApi.Caching;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Linq;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers
{
    [Route("api/routes")]
    [ApiVersion("1.0")]
    public class RoutesController : BaseApiController
    {
        // GET /api/routes?search=&categoryId=&tagIds=&sort=rating&page=1&pageSize=20
        // GET /api/routes?nearLat=&nearLng=&radiusKm=
        // GET /api/routes?authorId=&visibility=public&type=official|community|sponsored
        [HttpGet]
        [OutputCache(PolicyName = OutputCachePolicies.RoutesList)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<RouteListViewModel>))]
        public async Task<IActionResult> GetAll(
            [FromQuery] string search = null,
            [FromQuery] Guid? tagId = null,
            [FromQuery] string tagIds = null,
            [FromQuery] string sort = null,
            [FromQuery] double? nearLat = null,
            [FromQuery] double? nearLng = null,
            [FromQuery] double? radiusKm = null,
            [FromQuery] Guid? authorId = null,
            [FromQuery] string visibility = null,
            [FromQuery] string type = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var tagIdList = string.IsNullOrEmpty(tagIds)
                ? null
                : tagIds.Split(',').Select(t => Guid.TryParse(t.Trim(), out var g) ? g : (Guid?)null).Where(g => g.HasValue).Select(g => g.Value).ToList();

            if (string.Equals(visibility, "draft", StringComparison.OrdinalIgnoreCase))
            {
                var rawUserId = User.FindFirstValue("uid");
                if (string.IsNullOrEmpty(rawUserId) || !Guid.TryParse(rawUserId, out var currentUserId))
                {
                    return Unauthorized();
                }

                if (!authorId.HasValue)
                {
                    authorId = currentUserId;
                }
                else if (authorId.Value != currentUserId && !User.IsInRole(RoleNames.Admin))
                {
                    return Forbid();
                }
            }

            return Ok(await Mediator.Send(new GetPagedRoutesQuery
            {
                Search = search,
                TagId = tagId,
                TagIds = tagIdList,
                Sort = sort,
                NearLat = nearLat,
                NearLng = nearLng,
                RadiusKm = radiusKm,
                AuthorId = authorId,
                Visibility = visibility,
                Type = type,
                PageNumber = page,
                PageSize = pageSize
            }));
        }

        // GET /api/routes/{routeId}
        [HttpGet("{routeId}")]
        [OutputCache(PolicyName = OutputCachePolicies.RouteDetail)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<GetRouteByIdViewModel>))]
        public async Task<IActionResult> GetById(Guid routeId)
        {
            var response = await Mediator.Send(new GetRouteByIdQuery { Id = routeId });
            if (response?.Data is not null && !response.Data.IsPublic)
            {
                var rawUserId = User.FindFirstValue("uid");
                if (string.IsNullOrEmpty(rawUserId) || !Guid.TryParse(rawUserId, out var currentUserId))
                {
                    return Unauthorized();
                }

                var isOwner = response.Data.AuthorUserId == currentUserId;
                var isAdmin = User.IsInRole(RoleNames.Admin);
                if (!isOwner && !isAdmin)
                {
                    return Forbid();
                }
            }

            return Ok(response);
        }

        // POST /api/routes
        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Create([FromServices] IOutputCacheStore outputCacheStore, [FromBody] CreateRouteCommand command)
        {
            var response = await Mediator.Send(command);
            await OutputCacheTags.EvictRoutesAndSpotsAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        // PATCH /api/routes/{routeId}
        [HttpPatch("{routeId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Update(Guid routeId, [FromServices] IOutputCacheStore outputCacheStore, [FromBody] UpdateRouteCommand command)
        {
            command.Id = routeId;
            var response = await Mediator.Send(command);
            await OutputCacheTags.EvictRoutesAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        // DELETE /api/routes/{routeId}
        [HttpDelete("{routeId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Delete(Guid routeId, [FromServices] IOutputCacheStore outputCacheStore)
        {
            var response = await Mediator.Send(new DeleteRouteCommand { Id = routeId });
            await OutputCacheTags.EvictRoutesAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        // POST /api/routes/{routeId}/fork
        [HttpPost("{routeId}/fork")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Fork(Guid routeId, [FromServices] IOutputCacheStore outputCacheStore)
        {
            var response = await Mediator.Send(new ForkRouteCommand { OriginalRouteId = routeId });
            await OutputCacheTags.EvictRoutesAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        // POST /api/routes/{routeId}/publish
        [HttpPost("{routeId}/publish")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Publish(Guid routeId, [FromServices] IOutputCacheStore outputCacheStore)
        {
            var response = await Mediator.Send(new PublishRouteCommand { Id = routeId });
            await OutputCacheTags.EvictRoutesAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        // POST /api/routes/{routeId}/unpublish
        [HttpPost("{routeId}/unpublish")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Unpublish(Guid routeId, [FromServices] IOutputCacheStore outputCacheStore)
        {
            var response = await Mediator.Send(new UnpublishRouteCommand { Id = routeId });
            await OutputCacheTags.EvictRoutesAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        // PUT /api/routes/{routeId}/rating
        [HttpPut("{routeId}/rating")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<RouteRatingResultViewModel>))]
        public async Task<IActionResult> Rate(Guid routeId, [FromServices] IOutputCacheStore outputCacheStore, [FromBody] RateRouteCommand command)
        {
            command.RouteId = routeId;
            var response = await Mediator.Send(command);
            await OutputCacheTags.EvictRoutesAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        // PUT /api/routes/{routeId}/redraw
        [HttpPut("{routeId}/redraw")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<RouteGeometryResult>))]
        public async Task<IActionResult> Redraw(Guid routeId, [FromServices] IOutputCacheStore outputCacheStore)
        {
            var response = await Mediator.Send(new RedrawRouteCommand { Id = routeId });
            await OutputCacheTags.EvictRoutesAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        // GET /api/routes/{routeId}/ratings
        [HttpGet("{routeId}/ratings")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetRatings(Guid routeId)
        {
            return Ok(await Mediator.Send(new GetRouteRatingsQuery { RouteId = routeId }));
        }
    }
}
