using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Ant.Application.Features.Spots.Queries.GetAdminSpots;
using Ant.Application.Features.Spots.Commands.CreateSpot;
using Ant.Application.Features.Spots.Commands.UpdateSpot;
using Ant.Application.Features.Spots.Commands.DeleteSpot;
using Ant.WebApi.Caching;

namespace Ant.WebApi.Controllers.Admin
{
    [ApiVersion("1.0")]
    [Route("api/admin/spots")]
    [Authorize(Roles = "Admin")]
    public class AdminSpotsController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetAdminSpotsQuery filter)
        {
            return Ok(await Mediator.Send(filter));
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromServices] IOutputCacheStore outputCacheStore, CreateSpotCommand command)
        {
            var response = await Mediator.Send(command);
            await OutputCacheTags.EvictSpotsAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(System.Guid id, [FromServices] IOutputCacheStore outputCacheStore, UpdateSpotCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest();
            }

            var response = await Mediator.Send(command);
            await OutputCacheTags.EvictRoutesAndSpotsAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(System.Guid id, [FromServices] IOutputCacheStore outputCacheStore)
        {
            var response = await Mediator.Send(new DeleteSpotCommand(id));
            await OutputCacheTags.EvictRoutesAndSpotsAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }
    }
}
