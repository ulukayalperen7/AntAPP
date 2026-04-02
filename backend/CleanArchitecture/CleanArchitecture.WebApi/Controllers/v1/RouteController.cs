using CleanArchitecture.Core.Features.Routes.Commands.CreateRoute;
using CleanArchitecture.Core.Features.Routes.Queries.GetNearbyRoutes;
using CleanArchitecture.Core.Features.Routes.Queries.GetPagedRoutes;
using CleanArchitecture.Core.Features.Routes.Queries.GetRouteById;
using CleanArchitecture.Core.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers.v1
{
    /// <summary>
    /// Controller for managing visual journeys (Routes) composed of multiple Spots.
    /// </summary>
    [ApiVersion("1.0")]
    public class RouteController : BaseApiController
    {
        /// <summary>
        /// CREATE ROUTE (POST) - Register a new route.
        /// Ensure the JSON payload contains at least 2 Spots.
        /// </summary>
        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Post(CreateRouteCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        /// <summary>
        /// GET ROUTE DETAILS (GET) - Fetch a complete route including its ordered sequence of stops (Spots).
        /// This is public (anyone can view a route).
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<GetRouteByIdViewModel>))]
        public async Task<IActionResult> Get(Guid id)
        {
            return Ok(await Mediator.Send(new GetRouteByIdQuery { Id = id }));
        }

        /// <summary>
        /// GET ROUTES (GET) - Fetch a paginated list of routes for the Explore feed.
        /// Supports filtering by CategoryId and SearchTerm.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Get([FromQuery] GetPagedRoutesQuery query)
        {
            return Ok(await Mediator.Send(query));
        }

        /// <summary>
        /// GET NEARBY ROUTES (GET) - Fetch a list of routes near a specific location.
        /// Uses PostGIS spatial queries under the hood. Radius is in meters (default 5000 = 5km).
        /// </summary>
        [HttpGet("nearby")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetNearby([FromQuery] double lat, [FromQuery] double lng, [FromQuery] double radius = 5000, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var query = new GetNearbyRoutesQuery 
            { 
                Latitude = lat, 
                Longitude = lng, 
                RadiusInMeters = radius, 
                PageNumber = pageNumber, 
                PageSize = pageSize 
            };
            return Ok(await Mediator.Send(query));
        }
    }
}
