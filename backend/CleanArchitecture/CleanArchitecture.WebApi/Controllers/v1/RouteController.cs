using CleanArchitecture.Core.Features.Routes.Commands.CreateRoute;
using CleanArchitecture.Core.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers.v1
{
    /// <summary>
    /// Controller for managing visual journeys (Routes) composed of multiple Spots.
    /// </summary>
    [ApiVersion("1.0")]
    public class RouteController : BaseApiController
    {
        /// <summary>
        /// CREATE ROUTE (POST) - Register a new route.
        /// Ensure the JSON payload contains at least 2 Spots.
        /// </summary>
        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Post(CreateRouteCommand command)
        {
            return Ok(await Mediator.Send(command));
        }
    }
}
