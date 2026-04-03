using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitecture.WebApi.Controllers.Business
{
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/business")]
    [Authorize(Roles = "BusinessUser")]
    public class BusinessController : BaseApiController
    {
    }
}
