using Ant.Application.Features.Posts.Commands.CreatePost;
using Ant.Application.Features.Posts.Queries.GetFeedPosts;
using Ant.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers
{
    [Route("api/posts")]
    [ApiVersion("1.0")]
    [Authorize]
    public class PostsController : BaseApiController
    {
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<FeedPostViewModel>))]
        public async Task<IActionResult> GetFeed(
            [FromQuery] string mode = "timeline",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            return Ok(await Mediator.Send(new GetFeedPostsQuery
            {
                Mode = mode,
                PageNumber = page,
                PageSize = pageSize
            }));
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<System.Guid>))]
        public async Task<IActionResult> Create([FromBody] CreatePostCommand command)
        {
            return Ok(await Mediator.Send(command));
        }
    }
}
