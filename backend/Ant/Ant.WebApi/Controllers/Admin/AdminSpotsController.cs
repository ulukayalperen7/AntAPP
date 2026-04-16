using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ant.Application.Features.Spots.Queries.GetAdminSpots;
using Ant.Application.Features.Spots.Commands.CreateSpot;
using Ant.Application.Features.Spots.Commands.UpdateSpot;
using Ant.Application.Features.Spots.Commands.DeleteSpot;

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
        public async Task<IActionResult> Post(CreateSpotCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(System.Guid id, UpdateSpotCommand command)
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
            return Ok(await Mediator.Send(new DeleteSpotCommand(id)));
        }
    }
}
