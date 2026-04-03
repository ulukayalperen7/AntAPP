using CleanArchitecture.Core.Features.Spots.Commands.CreateSpot;
using CleanArchitecture.Core.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers
{
    [ApiVersion("1.0")]
    public class SpotsController : BaseApiController
    {
        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Create(CreateSpotCommand command)
        {
            return Ok(await Mediator.Send(command));
        }
    }
}
