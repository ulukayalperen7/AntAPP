using Ant.Application.Features.Tags.Commands.CreateTag;
using Ant.Application.Features.Tags.Commands.DeleteTagById;
using Ant.WebApi.Caching;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using System;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers.Admin
{
    [ApiVersion("1.0")]
    [Route("api/admin/tags")]
    [Authorize(Roles = "Admin")]
    public class AdminTagsController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var response = await Mediator.Send(new Ant.Application.Features.Tags.Queries.GetAllTags.GetAllTagsQuery { PageNumber = 1, PageSize = 1000 });
            return Ok(response);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Create([FromServices] IOutputCacheStore outputCacheStore, CreateTagCommand command)
        {
            var response = await Mediator.Send(command);
            await OutputCacheTags.EvictTagsAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Delete(Guid id, [FromServices] IOutputCacheStore outputCacheStore)
        {
            var response = await Mediator.Send(new DeleteTagByIdCommand { Id = id });
            await OutputCacheTags.EvictTagsAsync(outputCacheStore, HttpContext.RequestAborted);
            return Ok(response);
        }
    }
}
