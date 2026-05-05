using Ant.Application.Features.Profiles.Commands.ToggleUserFollow;
using Ant.Application.Features.Profiles.Queries.GetProfileConnections;
using Ant.Application.Features.Profiles.Queries.GetPublicProfile;
using Ant.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers
{
    [Route("api/profiles")]
    [ApiVersion("1.0")]
    public class ProfilesController : BaseApiController
    {
        [HttpGet("{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<PublicProfileViewModel>))]
        public async Task<IActionResult> Get(Guid userId)
        {
            return Ok(await Mediator.Send(new GetPublicProfileQuery { UserId = userId }));
        }

        [HttpGet("{userId}/followers")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<System.Collections.Generic.List<ProfileConnectionViewModel>>))]
        public async Task<IActionResult> GetFollowers(Guid userId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50)
        {
            return Ok(await Mediator.Send(new GetProfileConnectionsQuery
            {
                UserId = userId,
                Type = "followers",
                PageNumber = pageNumber,
                PageSize = pageSize
            }));
        }

        [HttpGet("{userId}/following")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<System.Collections.Generic.List<ProfileConnectionViewModel>>))]
        public async Task<IActionResult> GetFollowing(Guid userId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50)
        {
            return Ok(await Mediator.Send(new GetProfileConnectionsQuery
            {
                UserId = userId,
                Type = "following",
                PageNumber = pageNumber,
                PageSize = pageSize
            }));
        }

        [HttpPost("{userId}/follow")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<UserFollowSummaryViewModel>))]
        public async Task<IActionResult> ToggleFollow(Guid userId)
        {
            return Ok(await Mediator.Send(new ToggleUserFollowCommand { UserId = userId }));
        }
    }
}
