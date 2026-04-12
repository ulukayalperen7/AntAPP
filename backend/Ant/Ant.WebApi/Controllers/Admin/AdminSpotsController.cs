using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Ant.WebApi.Controllers.Admin
{
    [ApiVersion("1.0")]
    [Route("api/admin/spots")]
    [Authorize(Roles = "Admin")]
    public class AdminSpotsController : BaseApiController
    {
    }
}
