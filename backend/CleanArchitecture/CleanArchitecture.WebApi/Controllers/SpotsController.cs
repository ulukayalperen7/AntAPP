using CleanArchitecture.Core.Features.Spots.Queries.GetSpots;
using CleanArchitecture.Core.Features.Spots.Queries.GetSpotById;
using CleanArchitecture.Core.Features.Spots.Queries.GetSpotRoutes;
using CleanArchitecture.Core.Features.SpotRatings.Commands.RateSpot;
using CleanArchitecture.Core.Features.SpotRatings.Queries.GetSpotRatings;
using CleanArchitecture.Core.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers
{
    [Route("api/spots")]
    [ApiVersion("1.0")]
    public class SpotsController : BaseApiController
    {
        // GET /api/spots
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<SpotListViewModel>))]
        public async Task<IActionResult> GetAll(
            [FromQuery] string search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            return Ok(await Mediator.Send(new GetSpotsQuery
            {
                Search = search,
                PageNumber = page,
                PageSize = pageSize
            }));
        }

        // GET /api/spots/{spotId}
        [HttpGet("{spotId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<SpotDetailViewModel>))]
        public async Task<IActionResult> GetById(Guid spotId)
        {
            return Ok(await Mediator.Send(new GetSpotByIdQuery { Id = spotId }));
        }

        // GET /api/spots/{spotId}/routes
        [HttpGet("{spotId}/routes")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<SpotRouteViewModel>))]
        public async Task<IActionResult> GetRoutes(Guid spotId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            return Ok(await Mediator.Send(new GetSpotRoutesQuery
            {
                SpotId = spotId,
                PageNumber = page,
                PageSize = pageSize
            }));
        }

        // PUT /api/spots/{spotId}/rating
        [HttpPut("{spotId}/rating")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Rate(Guid spotId, [FromBody] RateSpotCommand command)
        {
            command.SpotId = spotId;
            return Ok(await Mediator.Send(command));
        }

        // GET /api/spots/{spotId}/ratings
        [HttpGet("{spotId}/ratings")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetRatings(Guid spotId)
        {
            return Ok(await Mediator.Send(new GetSpotRatingsQuery { SpotId = spotId }));
        }
    }
}
