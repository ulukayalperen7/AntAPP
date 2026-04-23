using Ant.Application.Features.RouteStops.Commands.AddRouteStop;
using Ant.Application.Features.RouteStops.Commands.RemoveRouteStop;
using Ant.Application.Features.RouteStops.Commands.ReorderRouteStops;
using Ant.Application.Features.RouteStops.Commands.UpdateRouteStop;
using Ant.Application.Features.RouteStops.Queries.GetRouteStops;
using Ant.Application.Wrappers;
using Ant.WebApi.Caching;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers
{
    [Route("api/routes/{routeId}/stops")]
    [ApiVersion("1.0")]
    public class RouteStopsController : BaseApiController
    {
        // GET /api/routes/{routeId}/stops
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<List<RouteStopViewModel>>))]
        public async Task<IActionResult> GetAll(Guid routeId)
        {
            return Ok(await Mediator.Send(new GetRouteStopsQuery { RouteId = routeId }));
        }

        // POST /api/routes/{routeId}/stops
        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Add(Guid routeId, [FromServices] IOutputCacheStore outputCacheStore, AddRouteStopCommand command)
        {
            command.RouteId = routeId;
            var response = await Mediator.Send(command);
            await OutputCacheTags.EvictRoutesAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        // PATCH /api/routes/{routeId}/stops/{routeStopId}
        [HttpPatch("{routeStopId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Update(Guid routeId, Guid routeStopId, [FromServices] IOutputCacheStore outputCacheStore, UpdateRouteStopCommand command)
        {
            command.RouteId = routeId;
            command.RouteStopId = routeStopId;
            var response = await Mediator.Send(command);
            await OutputCacheTags.EvictRoutesAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        // DELETE /api/routes/{routeId}/stops/{routeStopId}
        [HttpDelete("{routeStopId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Remove(Guid routeId, Guid routeStopId, [FromServices] IOutputCacheStore outputCacheStore)
        {
            var response = await Mediator.Send(new RemoveRouteStopCommand
            {
                RouteId = routeId,
                RouteStopId = routeStopId
            });
            await OutputCacheTags.EvictRoutesAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        // PUT /api/routes/{routeId}/stops/reorder
        [HttpPut("reorder")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<string>))]
        public async Task<IActionResult> Reorder(Guid routeId, [FromServices] IOutputCacheStore outputCacheStore, [FromBody] ReorderRouteStopsCommand command)
        {
            command.RouteId = routeId;
            var response = await Mediator.Send(command);
            await OutputCacheTags.EvictRoutesAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }
    }
}
