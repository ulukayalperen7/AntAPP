using Ant.Application.Features.Spots.Queries.GetSpots;
using Ant.Application.Features.Spots.Queries.GetSpotById;
using Ant.Application.Features.Spots.Queries.GetSpotRoutes;
using Ant.Application.Features.SpotRatings.Commands.RateSpot;
using Ant.Application.Features.SpotRatings.Queries.GetSpotRatings;
using Ant.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Ant.Application.Features.Spots.Commands.ToggleSpotFavorite;
using Ant.Application.Features.Spots.Queries.GetSavedSpots;
using Ant.WebApi.Caching;

namespace Ant.WebApi.Controllers
{
    [Route("api/spots")]
    [ApiVersion("1.0")]
    public class SpotsController : BaseApiController
    {
        // GET /api/spots
        [HttpGet]
        [OutputCache(PolicyName = OutputCachePolicies.SpotsList)]
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
        [OutputCache(PolicyName = OutputCachePolicies.SpotDetail)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<SpotDetailViewModel>))]
        public async Task<IActionResult> GetById(Guid spotId)
        {
            return Ok(await Mediator.Send(new GetSpotByIdQuery { Id = spotId }));
        }

        // GET /api/spots/{spotId}/routes
        [HttpGet("{spotId}/routes")]
        [OutputCache(PolicyName = OutputCachePolicies.SpotRoutes)]
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
        public async Task<IActionResult> Rate(Guid spotId, [FromServices] IOutputCacheStore outputCacheStore, [FromBody] RateSpotCommand command)
        {
            command.SpotId = spotId;
            var response = await Mediator.Send(command);
            await OutputCacheTags.EvictSpotsAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        // GET /api/spots/{spotId}/ratings
        [HttpGet("{spotId}/ratings")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetRatings(Guid spotId)
        {
            return Ok(await Mediator.Send(new GetSpotRatingsQuery { SpotId = spotId }));
        }

        // POST /api/spots/{spotId}/favorite
        [HttpPost("{spotId}/favorite")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<bool>))]
        public async Task<IActionResult> ToggleFavorite(Guid spotId)
        {
            var userId = Guid.Parse(User.FindFirstValue("uid"));
            return Ok(await Mediator.Send(new ToggleSpotFavoriteCommand { SpotId = spotId, UserId = userId }));
        }

        // GET /api/v1/spots/favorites
        [HttpGet("favorites")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<List<SpotListViewModel>>))]
        public async Task<IActionResult> GetSavedSpots()
        {
            var userId = Guid.Parse(User.FindFirstValue("uid"));
            return Ok(await Mediator.Send(new GetSavedSpotsQuery { UserId = userId }));
        }
    }
}
