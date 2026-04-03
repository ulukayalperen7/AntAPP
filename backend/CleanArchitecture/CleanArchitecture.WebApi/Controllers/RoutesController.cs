using CleanArchitecture.Core.Features.Routes.Commands.CreateRoute;
using CleanArchitecture.Core.Features.Routes.Queries.GetRouteById;
using CleanArchitecture.Core.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using PagedRoutes = CleanArchitecture.Core.Features.Routes.Queries.GetPagedRoutes;
using NearbyRoutes = CleanArchitecture.Core.Features.Routes.Queries.GetNearbyRoutes;

namespace CleanArchitecture.WebApi.Controllers
{
    [ApiVersion("1.0")]
    public class RoutesController : BaseApiController
    {
        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Create(CreateRouteCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<GetRouteByIdViewModel>))]
        public async Task<IActionResult> GetById(Guid id)
        {
            return Ok(await Mediator.Send(new GetRouteByIdQuery { Id = id }));
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<PagedRoutes.RouteListViewModel>))]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] Guid? categoryId = null,
            [FromQuery] string searchTerm = null)
        {
            return Ok(await Mediator.Send(new PagedRoutes.GetPagedRoutesQuery
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                CategoryId = categoryId,
                SearchTerm = searchTerm
            }));
        }

        [HttpGet("nearby")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<NearbyRoutes.RouteListViewModel>))]
        public async Task<IActionResult> GetNearby(
            [FromQuery] double latitude,
            [FromQuery] double longitude,
            [FromQuery] double radiusInMeters = 5000,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            return Ok(await Mediator.Send(new NearbyRoutes.GetNearbyRoutesQuery
            {
                Latitude = latitude,
                Longitude = longitude,
                RadiusInMeters = radiusInMeters,
                PageNumber = pageNumber,
                PageSize = pageSize
            }));
        }
    }
}
