using Ant.Application.Features.Admin.Queries.GetAdminStats;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers.Admin
{
    [ApiVersion("1.0")]
    [Authorize(Roles = "Admin")]
    public class AdminDashboardController : BaseApiController
    {
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            return Ok(await Mediator.Send(new GetAdminStatsQuery()));
        }
    }
}
