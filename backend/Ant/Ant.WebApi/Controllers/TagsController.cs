using Ant.Application.Features.Tags.Queries.GetAllTags;
using Ant.Application.Wrappers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers
{
    [Route("api/tags")]
    [ApiVersion("1.0")]
    public class TagsController : BaseApiController
    {
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<GetAllTagsViewModel>))]
        public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            return Ok(await Mediator.Send(new GetAllTagsQuery
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            }));
        }
    }
}
