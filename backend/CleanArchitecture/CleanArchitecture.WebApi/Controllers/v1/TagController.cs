using CleanArchitecture.Core.Features.Tags.Commands.CreateTag;
using CleanArchitecture.Core.Features.Tags.Commands.DeleteTagById;
using CleanArchitecture.Core.Features.Tags.Queries.GetAllTags;
using CleanArchitecture.Core.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers.v1
{
    /// <summary>
    /// This controller handles all requests related to Tags (labels like Nature, Food, Historical).
    /// Tags are flexible labels that can be attached to Routes.
    /// A Route can have multiple Tags (many-to-many relationship).
    /// </summary>
    [ApiVersion("1.0")]
    public class TagController : BaseApiController
    {
        // 1. CREATE TAG (POST) - Add a new tag to the system.
        // Example: Adding "Sunset Spots" as a new tag.
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Post(CreateTagCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        // 2. GET ALL TAGS (GET) - List all available tags with pagination.
        // This is public because everyone needs to see tags.
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<GetAllTagsViewModel>))]
        public async Task<IActionResult> Get([FromQuery] GetAllTagsParameter filter)
        {
            return Ok(await Mediator.Send(new GetAllTagsQuery() { PageSize = filter.PageSize, PageNumber = filter.PageNumber }));
        }

        // 3. DELETE TAG (DELETE) - Remove a tag by its ID.
        // SECURITY: Only Admins can delete tags.
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Delete(Guid id)
        {
            return Ok(await Mediator.Send(new DeleteTagByIdCommand { Id = id }));
        }
    }
}
