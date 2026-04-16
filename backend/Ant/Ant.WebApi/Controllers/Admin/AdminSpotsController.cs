using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Ant.WebApi.Controllers.Admin
{
    [ApiVersion("1.0")]
    [Route("api/admin/spots")]
    [Authorize(Roles = "Admin")]
    public class AdminSpotsController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] Features.Spots.Queries.GetAdminSpots.GetAdminSpotsQuery filter)
        {
            return Ok(await Mediator.Send(filter));
        }

        [HttpPost]
        public async Task<IActionResult> Post(Features.Spots.Commands.CreateSpot.CreateSpotCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(System.Guid id, Features.Spots.Commands.UpdateSpot.UpdateSpotCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest();
            }
            return Ok(await Mediator.Send(command));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(System.Guid id)
        {
            return Ok(await Mediator.Send(new Features.Spots.Commands.DeleteSpot.DeleteSpotCommand(id)));
        }
    }
}
