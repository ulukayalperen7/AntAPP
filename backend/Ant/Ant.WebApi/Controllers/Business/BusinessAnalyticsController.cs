using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Ant.WebApi.Controllers.Business
{
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/business/analytics")]
    [Authorize(Roles = "BusinessUser")]
    public class BusinessAnalyticsController : BaseApiController
    {
    }
}
