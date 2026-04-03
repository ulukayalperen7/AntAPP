using CleanArchitecture.Core.Features.Collections.Commands.AddRouteToCollection;
using CleanArchitecture.Core.Features.Collections.Commands.DeleteCollection;
using CleanArchitecture.Core.Features.Collections.Commands.RemoveRouteFromCollection;
using CleanArchitecture.Core.Features.Collections.Commands.UpdateCollection;
using CleanArchitecture.Core.Features.Collections.Queries.GetCollectionById;
using CleanArchitecture.Core.Features.Collections.Queries.GetCollections;
using CleanArchitecture.Core.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers.Admin
{
    [Route("api/admin/collections")]
    [ApiVersion("1.0")]
    [Authorize(Roles = "Admin")]
    public class AdminCollectionsController : BaseApiController
    {
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<CollectionViewModel>))]
        public async Task<IActionResult> GetAll([FromQuery] GetCollectionsParameter filter)
        {
            return Ok(await Mediator.Send(new GetCollectionsQuery
            {
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize
            }));
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CollectionDetailViewModel))]
        public async Task<IActionResult> GetById(Guid id)
        {
            return Ok(await Mediator.Send(new GetCollectionByIdQuery { Id = id }));
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Update(Guid id, UpdateCollectionCommand command)
        {
            command.Id = id;
            return Ok(await Mediator.Send(command));
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Delete(Guid id)
        {
            return Ok(await Mediator.Send(new DeleteCollectionCommand { Id = id }));
        }

        [HttpPost("{id}/routes")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> AddRoute(Guid id, AddRouteToCollectionCommand command)
        {
            command.CollectionId = id;
            return Ok(await Mediator.Send(command));
        }

        [HttpDelete("{id}/routes/{routeId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> RemoveRoute(Guid id, Guid routeId)
        {
            return Ok(await Mediator.Send(new RemoveRouteFromCollectionCommand
            {
                CollectionId = id,
                RouteId = routeId
            }));
        }

        [HttpGet("~/api/admin/users/{userId}/collections")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<CollectionViewModel>))]
        public async Task<IActionResult> GetUserCollections(Guid userId, [FromQuery] GetCollectionsParameter filter)
        {
            return Ok(await Mediator.Send(new GetCollectionsQuery
            {
                UserId = userId,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize
            }));
        }
    }
}
