using CleanArchitecture.Core.Features.Spots.Commands.CreateSpot;
using CleanArchitecture.Core.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers.v1
{
    /// <summary>
    /// Controller for managing standalone points of interest (Spots).
    /// </summary>
    [ApiVersion("1.0")]
    public class SpotController : BaseApiController
    {
        /// <summary>
        /// CREATE SPOT (POST) - Register a new physical location in the system.
        /// Requires the user to be authenticated.
        /// </summary>
        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Post(CreateSpotCommand command)
        {
            return Ok(await Mediator.Send(command));
        }
    }
}
