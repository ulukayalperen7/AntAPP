using CleanArchitecture.Core.Features.RouteStops.Commands.AddRouteStop;
using CleanArchitecture.Core.Features.RouteStops.Commands.RemoveRouteStop;
using CleanArchitecture.Core.Features.RouteStops.Commands.ReorderRouteStops;
using CleanArchitecture.Core.Features.RouteStops.Commands.UpdateRouteStop;
using CleanArchitecture.Core.Features.RouteStops.Queries.GetRouteStops;
using CleanArchitecture.Core.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers
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
        public async Task<IActionResult> Add(Guid routeId, AddRouteStopCommand command)
        {
            command.RouteId = routeId;
            return Ok(await Mediator.Send(command));
        }

        // PATCH /api/routes/{routeId}/stops/{routeStopId}
        [HttpPatch("{routeStopId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Update(Guid routeId, Guid routeStopId, UpdateRouteStopCommand command)
        {
            command.RouteId = routeId;
            command.RouteStopId = routeStopId;
            return Ok(await Mediator.Send(command));
        }

        // DELETE /api/routes/{routeId}/stops/{routeStopId}
        [HttpDelete("{routeStopId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Remove(Guid routeId, Guid routeStopId)
        {
            return Ok(await Mediator.Send(new RemoveRouteStopCommand
            {
                RouteId = routeId,
                RouteStopId = routeStopId
            }));
        }

        // PUT /api/routes/{routeId}/stops/reorder
        [HttpPut("reorder")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<string>))]
        public async Task<IActionResult> Reorder(Guid routeId, [FromBody] ReorderRouteStopsCommand command)
        {
            command.RouteId = routeId;
            return Ok(await Mediator.Send(command));
        }
    }
}
