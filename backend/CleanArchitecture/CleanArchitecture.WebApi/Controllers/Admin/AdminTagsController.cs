using CleanArchitecture.Core.Features.Tags.Commands.CreateTag;
using CleanArchitecture.Core.Features.Tags.Commands.DeleteTagById;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers.Admin
{
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/admin/tags")]
    [Authorize(Roles = "Admin")]
    public class AdminTagsController : BaseApiController
    {
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
