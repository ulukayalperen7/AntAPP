using Ant.Application.DTOs;
using Ant.Application.Features.Heatmap.Commands.UpdateLocation;
using Ant.Application.Features.Heatmap.Queries.GetHeatmapTiles;
using Ant.Application.Wrappers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers
{
    [Route("api/heatmap")]
    [ApiVersion("1.0")]
    public class HeatmapController : BaseApiController
    {
        [HttpPost("ping")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<bool>))]
        public async Task<IActionResult> Ping([FromBody] UpdateLocationCommand command)
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();

            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new Response<bool>("Missing or invalid Authorization header."));
            }

            var token = authHeader["Bearer ".Length..].Trim();
            command.TokenHash = ComputeSha256(token);

            return Ok(await Mediator.Send(command));
        }

        [HttpGet("tiles")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<List<HeatmapTileDto>>))]
        public async Task<IActionResult> GetTiles(
            [FromQuery] double minLat,
            [FromQuery] double minLng,
            [FromQuery] double maxLat,
            [FromQuery] double maxLng,
            [FromQuery] int zoom = 14)
        {
            return Ok(await Mediator.Send(new GetHeatmapTilesQuery
            {
                MinLat = minLat,
                MinLng = minLng,
                MaxLat = maxLat,
                MaxLng = maxLng,
                Zoom = zoom
            }));
        }

        private static string ComputeSha256(string input)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
            return BitConverter.ToString(bytes).Replace("-", "").ToLowerInvariant();
        }
    }
}
