using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitecture.WebApi.Controllers.Admin
{
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/admin/accounts")]
    [Authorize(Roles = "Admin")]
    public class AdminAccountsController : BaseApiController
    {
    }
}
