using Ant.Application.Features.Account.Commands.ChangePassword;
using Ant.Application.Features.Account.Commands.UpdateProfile;
using Ant.Application.Features.Account.Queries.GetCurrentUser;
using Ant.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers
{
    [Route("api/account")]
    [ApiVersion("1.0")]
    [Authorize]
    public class AccountController : BaseApiController
    {
        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<CurrentUserViewModel>))]
        public async Task<IActionResult> Me()
        {
            return Ok(await Mediator.Send(new GetCurrentUserQuery()));
        }

        [HttpPut("profile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> UpdateProfile(UpdateProfileCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        [HttpPost("change-password")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<string>))]
        public async Task<IActionResult> ChangePassword(ChangePasswordCommand command)
        {
            return Ok(await Mediator.Send(command));
        }
    }
}
