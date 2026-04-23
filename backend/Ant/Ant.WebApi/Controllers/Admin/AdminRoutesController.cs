using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Ant.Application.Features.Routes.Queries.GetAdminRoutes;
using Ant.Application.Features.Routes.Commands.PromoteRoute;
using Ant.WebApi.Caching;
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
        public async Task<IActionResult> Promote(Guid id, [FromServices] IOutputCacheStore outputCacheStore, [FromBody] PromoteRouteCommand command)
        {
            if (id != command.Id)
                return BadRequest();

            var response = await Mediator.Send(command);
            await OutputCacheTags.EvictRoutesAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }
    }
}
