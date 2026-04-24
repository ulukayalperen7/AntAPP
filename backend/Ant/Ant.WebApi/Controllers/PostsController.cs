using Ant.Application.Features.Posts.Commands.CreatePost;
using Ant.Application.Features.Posts.Commands.TogglePostReaction;
using Ant.Application.Features.Posts.Commands.AddPostComment;
using Ant.Application.Features.Posts.Commands.SharePost;
using Ant.Application.Features.Posts.Queries.GetFeedPosts;
using Ant.Application.Features.Posts.Queries.GetPostComments;
using Ant.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
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

        [HttpPost("{postId}/reactions/toggle")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<PostReactionSummaryViewModel>))]
        public async Task<IActionResult> ToggleReaction(Guid postId)
        {
            return Ok(await Mediator.Send(new TogglePostReactionCommand
            {
                PostId = postId
            }));
        }

        [HttpGet("{postId}/comments")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<PostCommentViewModel>))]
        public async Task<IActionResult> GetComments(
            Guid postId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            return Ok(await Mediator.Send(new GetPostCommentsQuery
            {
                PostId = postId,
                PageNumber = page,
                PageSize = pageSize
            }));
        }

        [HttpPost("{postId}/comments")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<PostCommentCreateViewModel>))]
        public async Task<IActionResult> AddComment(Guid postId, [FromBody] AddPostCommentCommand command)
        {
            command.PostId = postId;
            return Ok(await Mediator.Send(command));
        }

        [HttpPost("{postId}/shares")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<PostShareSummaryViewModel>))]
        public async Task<IActionResult> Share(Guid postId)
        {
            return Ok(await Mediator.Send(new SharePostCommand
            {
                PostId = postId
            }));
        }
    }
}
