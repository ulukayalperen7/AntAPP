using CleanArchitecture.Core.Features.Account.Commands.ChangePassword;
using CleanArchitecture.Core.Features.Account.Commands.UpdateProfile;
using CleanArchitecture.Core.Features.Account.Queries.GetCurrentUser;
using CleanArchitecture.Core.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers
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
