using Ant.Application.DTOs;
using Ant.Application.Features.Heatmap.Commands.UpdateLocation;
using Ant.Application.Features.Heatmap.Queries.GetHeatmapTiles;
using Ant.Application.Interfaces;
using Ant.Application.Settings;
using Ant.Application.Wrappers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers
{
    [Route("api/heatmap")]
    [ApiVersion("1.0")]
    public class HeatmapController : BaseApiController
    {
        private readonly IHeatmapService _heatmapService;
        private readonly TokenValidationParameters _tokenValidationParams;

        public HeatmapController(IHeatmapService heatmapService, IOptions<JWTSettings> jwtSettings)
        {
            _heatmapService = heatmapService;

            var jwt = jwtSettings.Value;
            _tokenValidationParams = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
                ValidIssuer = jwt.Issuer,
                ValidAudience = jwt.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key))
            };
        }

        [HttpPost("ping")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<bool>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Ping([FromBody] UpdateLocationCommand command)
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized("Missing or invalid Authorization header.");
            }

            var token = authHeader["Bearer ".Length..].Trim();
            var tokenHash = ComputeSha256(token);

            var userId = await _heatmapService.GetUserIdByTokenAsync(tokenHash, HttpContext.RequestAborted);

            if (userId == null)
            {
                userId = ValidateTokenAndExtractUserId(token);
                if (userId == null)
                {
                    return Unauthorized("Invalid or expired token.");
                }

                await _heatmapService.RegisterTokenAsync(tokenHash, userId, HttpContext.RequestAborted);
            }

            command.UserId = userId;

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

        private string ValidateTokenAndExtractUserId(string token)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var principal = handler.ValidateToken(token, _tokenValidationParams, out _);
                return principal.FindFirstValue("uid");
            }
            catch
            {
                return null;
            }
        }

        private static string ComputeSha256(string input)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
            return BitConverter.ToString(bytes).Replace("-", "").ToLowerInvariant();
        }
    }
}
