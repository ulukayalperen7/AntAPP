using Ant.Application.Features.RouteRatings.Commands.RateRoute;
using Ant.Application.Features.RouteRatings.Queries.GetRouteAverageRating;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers
{
    [ApiVersion("1.0")]
    public class RouteRatingsController : BaseApiController
    {
        [HttpPut]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Rate(RateRouteCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        [HttpGet("{routeId}/average")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GetRouteAverageRatingViewModel))]
        public async Task<IActionResult> GetAverage(Guid routeId)
        {
            return Ok(await Mediator.Send(new GetRouteAverageRatingQuery { RouteId = routeId }));
        }
    }
}
