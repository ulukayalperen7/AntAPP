using CleanArchitecture.Core.Features.Collections.Commands.AddRouteToCollection;
using CleanArchitecture.Core.Features.Collections.Commands.CreateCollection;
using CleanArchitecture.Core.Features.Collections.Commands.DeleteCollection;
using CleanArchitecture.Core.Features.Collections.Commands.RemoveRouteFromCollection;
using CleanArchitecture.Core.Features.Collections.Commands.SaveRoute;
using CleanArchitecture.Core.Features.Collections.Commands.UnsaveRoute;
using CleanArchitecture.Core.Features.Collections.Commands.UpdateCollection;
using CleanArchitecture.Core.Features.Collections.Queries.GetCollectionById;
using CleanArchitecture.Core.Features.Collections.Queries.GetCollections;
using CleanArchitecture.Core.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers.v1
{
    /// <summary>
    /// User-facing collection endpoints. All actions are scoped to the authenticated user.
    /// The user ID is always extracted from the JWT "uid" claim — never passed as a parameter.
    /// Also exposes /api/me/saved-routes as a mobile-friendly shortcut for the default "Saved Routes" collection.
    /// </summary>
    [Route("api/me/collections")]
    [ApiVersion("1.0")]
    [Authorize]
    public class UserCollectionController : BaseApiController
    {
        // GET /api/me/collections?pageNumber=1&pageSize=10
        // Returns the authenticated user's collections with route counts.
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<CollectionViewModel>))]
        public async Task<IActionResult> GetAll([FromQuery] GetCollectionsParameter filter)
        {
            return Ok(await Mediator.Send(new GetCollectionsQuery
            {
                UserId = GetUserId(),
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize
            }));
        }

        // POST /api/me/collections
        // Body: { name, isPublic, description, thumbnailUrl }
        // Creates a new collection owned by the authenticated user. Returns the new collection ID.
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Create(CreateCollectionCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        // GET /api/me/collections/{id}
        // Returns collection detail with its route list. Only works for collections the user owns.
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CollectionDetailViewModel))]
        public async Task<IActionResult> GetById(Guid id)
        {
            return Ok(await Mediator.Send(new GetCollectionByIdQuery
            {
                Id = id,
                UserId = GetUserId()
            }));
        }

        // PUT /api/me/collections/{id}
        // Body: { name, isPublic, description, thumbnailUrl }
        // Updates a collection the user owns. Returns the collection ID.
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Update(Guid id, UpdateCollectionCommand command)
        {
            command.Id = id;
            command.UserId = GetUserId();
            return Ok(await Mediator.Send(command));
        }

        // DELETE /api/me/collections/{id}
        // Deletes a collection the user owns. Returns the deleted collection ID.
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Delete(Guid id)
        {
            return Ok(await Mediator.Send(new DeleteCollectionCommand
            {
                Id = id,
                UserId = GetUserId()
            }));
        }

        // POST /api/me/collections/{id}/routes
        // Body: { routeId }
        // Adds a route to the user's collection. Fails if the route is already in the collection.
        [HttpPost("{id}/routes")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> AddRoute(Guid id, AddRouteToCollectionCommand command)
        {
            command.CollectionId = id;
            command.UserId = GetUserId();
            return Ok(await Mediator.Send(command));
        }

        // DELETE /api/me/collections/{id}/routes/{routeId}
        // Removes a route from the user's collection.
        [HttpDelete("{id}/routes/{routeId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> RemoveRoute(Guid id, Guid routeId)
        {
            return Ok(await Mediator.Send(new RemoveRouteFromCollectionCommand
            {
                CollectionId = id,
                RouteId = routeId,
                UserId = GetUserId()
            }));
        }

        // POST /api/me/saved-routes
        // Body: { routeId }
        // Mobile shortcut: saves a route to the user's default "Saved Routes" collection.
        // The default collection is auto-created on first use.
        [HttpPost("~/api/me/saved-routes")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> SaveRoute(SaveRouteCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        // DELETE /api/me/saved-routes/{routeId}
        // Mobile shortcut: removes a route from the user's default "Saved Routes" collection.
        [HttpDelete("~/api/me/saved-routes/{routeId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> UnsaveRoute(Guid routeId)
        {
            return Ok(await Mediator.Send(new UnsaveRouteCommand { RouteId = routeId }));
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue("uid"));
    }
}
