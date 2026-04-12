using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ant.Application.Features.Account.Queries.GetAdminAccounts;
using Ant.Application.Features.Account.Commands.UpdateUserStatus;
using System.Threading.Tasks;
using System;

namespace Ant.WebApi.Controllers.Admin
{
    [ApiVersion("1.0")]
    [Route("api/admin/accounts")]
    [Authorize(Roles = "Admin")]
    public class AdminAccountsController : BaseApiController
    {
        /// <summary>
        /// Get all user accounts (Admin only)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(await Mediator.Send(new GetAdminAccountsQuery()));
        }

        /// <summary>
        /// Update user status (Admin only)
        /// </summary>
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateUserStatusCommand command)
        {
            if (id != command.UserId)
                return BadRequest();

            return Ok(await Mediator.Send(command));
        }
    }
}
