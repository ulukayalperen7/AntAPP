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

namespace CleanArchitecture.WebApi.Controllers.v1
{
    /// <summary>
    /// Admin-only collection endpoints. No ownership checks are enforced —
    /// admins can view, edit, and delete any user's collections.
    /// SECURITY: Every action requires the "Admin" role.
    /// </summary>
    [Route("api/admin/collections")]
    [ApiVersion("1.0")]
    [Authorize(Roles = "Admin")]
    public class AdminCollectionController : BaseApiController
    {
        // GET /api/admin/collections?pageNumber=1&pageSize=10
        // Lists all collections across all users, ordered by creation date (newest first).
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

        // GET /api/admin/collections/{id}
        // Returns full collection detail with route list. No ownership check.
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CollectionDetailViewModel))]
        public async Task<IActionResult> GetById(Guid id)
        {
            return Ok(await Mediator.Send(new GetCollectionByIdQuery { Id = id }));
        }

        // PUT /api/admin/collections/{id}
        // Body: { name, isPublic, description, thumbnailUrl }
        // Updates any collection regardless of owner. Returns the collection ID.
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Update(Guid id, UpdateCollectionCommand command)
        {
            command.Id = id;
            return Ok(await Mediator.Send(command));
        }

        // DELETE /api/admin/collections/{id}
        // Deletes any collection regardless of owner. Returns the deleted collection ID.
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Delete(Guid id)
        {
            return Ok(await Mediator.Send(new DeleteCollectionCommand { Id = id }));
        }

        // POST /api/admin/collections/{id}/routes
        // Body: { routeId }
        // Adds a route to any collection. Fails if the route is already in the collection.
        [HttpPost("{id}/routes")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> AddRoute(Guid id, AddRouteToCollectionCommand command)
        {
            command.CollectionId = id;
            return Ok(await Mediator.Send(command));
        }

        // DELETE /api/admin/collections/{id}/routes/{routeId}
        // Removes a route from any collection.
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

        // GET /api/admin/users/{userId}/collections?pageNumber=1&pageSize=10
        // Lists all collections belonging to a specific user.
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
