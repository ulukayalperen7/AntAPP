using CleanArchitecture.Core.Features.Spots.Commands.CreateSpot;
using CleanArchitecture.Core.Features.Spots.Commands.DeleteSpot;
using CleanArchitecture.Core.Features.Spots.Commands.UpdateSpot;
using CleanArchitecture.Core.Features.Spots.Queries.GetBusinessSpots;
using CleanArchitecture.Core.Features.Spots.Queries.GetSpotById;
using CleanArchitecture.Core.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers.Business
{
    [Route("api/business/spots")]
    [ApiVersion("1.0")]
    [Authorize(Roles = "BusinessUser")]
    public class BusinessSpotsController : BaseApiController
    {
        // POST /api/business/spots
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Create(CreateSpotCommand command)
        {
            return Ok(await Mediator.Send(command));
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
        public async Task<IActionResult> Update(Guid spotId, UpdateSpotCommand command)
        {
            command.Id = spotId;
            command.EnforcedOwnerUserId = GetUserId();
            return Ok(await Mediator.Send(command));
        }

        // DELETE /api/business/spots/{spotId}
        [HttpDelete("{spotId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Delete(Guid spotId)
        {
            return Ok(await Mediator.Send(new DeleteSpotCommand
            {
                Id = spotId,
                EnforcedOwnerUserId = GetUserId()
            }));
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue("uid"));
    }
}
