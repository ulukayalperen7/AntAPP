using Ant.Application.Features.SpotRatings.Commands.RateSpot;
using Ant.Application.Features.SpotRatings.Queries.GetSpotAverageRating;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers
{
    [ApiVersion("1.0")]
    public class SpotRatingsController : BaseApiController
    {
        [HttpPut]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Rate(RateSpotCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        [HttpGet("{spotId}/average")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GetSpotAverageRatingViewModel))]
        public async Task<IActionResult> GetAverage(Guid spotId)
        {
            return Ok(await Mediator.Send(new GetSpotAverageRatingQuery { SpotId = spotId }));
        }
    }
}
