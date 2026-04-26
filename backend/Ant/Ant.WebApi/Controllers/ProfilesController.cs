using Ant.Application.Features.Profiles.Commands.ToggleUserFollow;
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

        [HttpPost("{userId}/follow")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<UserFollowSummaryViewModel>))]
        public async Task<IActionResult> ToggleFollow(Guid userId)
        {
            return Ok(await Mediator.Send(new ToggleUserFollowCommand { UserId = userId }));
        }
    }
}
