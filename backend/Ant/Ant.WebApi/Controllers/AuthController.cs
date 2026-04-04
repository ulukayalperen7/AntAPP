using Ant.Application.DTOs.Account;
using Ant.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace Ant.WebApi.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(AuthenticationRequest request)
        {
            var response = await _authService.AuthenticateAsync(request, GetIpAddress());
            SetRefreshTokenCookie(response.RefreshToken);
            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var origin = Request.Headers["origin"].FirstOrDefault() ?? "http://localhost:3000";
            var result = await _authService.RegisterAsync(request, origin);
            return Ok(new { message = result });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request = null)
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrWhiteSpace(refreshToken))
                refreshToken = request?.RefreshToken;

            if (string.IsNullOrEmpty(refreshToken))
                return BadRequest("Refresh token not found.");

            var response = await _authService.RefreshTokenAsync(refreshToken, GetIpAddress());
            SetRefreshTokenCookie(response.RefreshToken);
            return Ok(response);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("refreshToken");
            return Ok(new { message = "Logged out successfully." });
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string code)
        {
            return Ok(await _authService.ConfirmEmailAsync(userId, code));
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest model)
        {
            var origin = Request.Headers["origin"].FirstOrDefault() ?? "http://localhost:3000";
            await _authService.ForgotPassword(model, origin);
            return Ok("If an account with that email exists, a reset link has been sent.");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordRequest model)
        {
            return Ok(await _authService.ResetPassword(model));
        }

        private string GetIpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"];
            return HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
        }

        private void SetRefreshTokenCookie(string token)
        {
            Response.Cookies.Append("refreshToken", token, new CookieOptions
            {
                HttpOnly = true,
                Expires = System.DateTimeOffset.UtcNow.AddDays(7),
                SameSite = SameSiteMode.Strict,
                Secure = Request.IsHttps
            });
        }
    }
}
