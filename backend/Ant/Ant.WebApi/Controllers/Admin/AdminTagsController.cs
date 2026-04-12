using Ant.Application.Features.Tags.Commands.CreateTag;
using Ant.Application.Features.Tags.Commands.DeleteTagById;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
        public async Task<IActionResult> Create(CreateTagCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Guid))]
        public async Task<IActionResult> Delete(Guid id)
        {
            return Ok(await Mediator.Send(new DeleteTagByIdCommand { Id = id }));
        }
    }
}
