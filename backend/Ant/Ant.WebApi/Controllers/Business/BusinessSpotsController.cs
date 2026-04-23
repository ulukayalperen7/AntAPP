using Ant.Application.Features.Spots.Commands.CreateSpot;
using Ant.Application.Features.Spots.Commands.DeleteSpot;
using Ant.Application.Features.Spots.Commands.UpdateSpot;
using Ant.Application.Features.Spots.Queries.GetBusinessSpots;
using Ant.Application.Features.Spots.Queries.GetSpotById;
using Ant.Application.Wrappers;
using Ant.WebApi.Caching;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers.Business
{
    [Route("api/business/spots")]
    [ApiVersion("1.0")]
    [Authorize(Roles = "BusinessUser")]
    public class BusinessSpotsController : BaseApiController
    {
        // POST /api/business/spots
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Create([FromServices] IOutputCacheStore outputCacheStore, CreateSpotCommand command)
        {
            var response = await Mediator.Send(command);
            await OutputCacheTags.EvictSpotsAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        // GET /api/business/spots
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<BusinessSpotViewModel>))]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            return Ok(await Mediator.Send(new GetBusinessSpotsQuery
            {
                OwnerUserId = GetUserId(),
                PageNumber = page,
                PageSize = pageSize
            }));
        }

        // GET /api/business/spots/{spotId}
        [HttpGet("{spotId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<SpotDetailViewModel>))]
        public async Task<IActionResult> GetById(Guid spotId)
        {
            return Ok(await Mediator.Send(new GetSpotByIdQuery { Id = spotId }));
        }

        // PATCH /api/business/spots/{spotId}
        [HttpPatch("{spotId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Update(Guid spotId, [FromServices] IOutputCacheStore outputCacheStore, UpdateSpotCommand command)
        {
            command.Id = spotId;
            command.EnforcedOwnerUserId = GetUserId();
            var response = await Mediator.Send(command);
            await OutputCacheTags.EvictRoutesAndSpotsAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        // DELETE /api/business/spots/{spotId}
        [HttpDelete("{spotId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Delete(Guid spotId, [FromServices] IOutputCacheStore outputCacheStore)
        {
            var response = await Mediator.Send(new DeleteSpotCommand
            {
                Id = spotId,
                EnforcedOwnerUserId = GetUserId()
            });
            await OutputCacheTags.EvictRoutesAndSpotsAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue("uid"));
    }
}
