using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Ant.WebApi.Controllers.Admin
{
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/admin/categories")]
    [Authorize(Roles = "Admin")]
    public class AdminCategoriesController : BaseApiController
    {
    }
}
