using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ant.Application.Features.Routes.Queries.GetAdminRoutes;
using Ant.Application.Features.Routes.Commands.PromoteRoute;
using System.Threading.Tasks;
using System;

namespace Ant.WebApi.Controllers.Admin
{
    [ApiVersion("1.0")]
    [Route("api/admin/routes")]
    [Authorize(Roles = "Admin")]
    public class AdminRoutesController : BaseApiController
    {
        /// <summary>
        /// Get all routes for management (Admin only)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetAdminRoutesQuery filter)
        {
            return Ok(await Mediator.Send(filter));
        }

        /// <summary>
        /// Promote a route (Official/Sponsored)
        /// </summary>
        [HttpPut("{id}/promote")]
        public async Task<IActionResult> Promote(Guid id, [FromBody] PromoteRouteCommand command)
        {
            if (id != command.Id)
                return BadRequest();

            return Ok(await Mediator.Send(command));
        }
    }
}
