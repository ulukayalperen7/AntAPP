using Ant.Application.Features.Collections.Commands.AddRouteToCollection;
using Ant.Application.Features.Collections.Commands.CreateCollection;
using Ant.Application.Features.Collections.Commands.DeleteCollection;
using Ant.Application.Features.Collections.Commands.RemoveRouteFromCollection;
using Ant.Application.Features.Collections.Commands.SaveRoute;
using Ant.Application.Features.Collections.Commands.UnsaveRoute;
using Ant.Application.Features.Collections.Commands.UpdateCollection;
using Ant.Application.Features.Collections.Queries.GetCollectionById;
using Ant.Application.Features.Collections.Queries.GetCollections;
using Ant.Application.Wrappers;
using Ant.WebApi.Caching;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers
{
    [Route("api/me/collections")]
    [ApiVersion("1.0")]
    [Authorize]
    public class CollectionsController : BaseApiController
    {
        [HttpGet]
        [OutputCache(PolicyName = OutputCachePolicies.UserCollections, VaryByUserClaims = new[] { "uid" })]
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

        [HttpGet("{id}")]
        [OutputCache(PolicyName = OutputCachePolicies.UserCollectionDetail, VaryByUserClaims = new[] { "uid" })]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CollectionDetailViewModel))]
        public async Task<IActionResult> GetById(Guid id)
        {
            return Ok(await Mediator.Send(new GetCollectionByIdQuery
            {
                Id = id,
                UserId = GetUserId()
            }));
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Create([FromBody] CreateCollectionCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCollectionCommand command)
        {
            command.Id = id;
            command.UserId = GetUserId();
            return Ok(await Mediator.Send(command));
        }

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

        [HttpPost("{id}/routes")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> AddRoute(Guid id, [FromBody] AddRouteToCollectionCommand command)
        {
            command.CollectionId = id;
            command.UserId = GetUserId();
            return Ok(await Mediator.Send(command));
        }

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

        [HttpPost("~/api/me/saved-routes")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> SaveRoute([FromBody] SaveRouteCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        [HttpDelete("~/api/me/saved-routes/{routeId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> UnsaveRoute(Guid routeId)
        {
            return Ok(await Mediator.Send(new UnsaveRouteCommand { RouteId = routeId }));
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue("uid"));
    }
}
