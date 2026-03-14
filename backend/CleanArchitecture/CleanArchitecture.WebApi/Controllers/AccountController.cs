using CleanArchitecture.Core.DTOs.Account;
using CleanArchitecture.Core.Enums;
using CleanArchitecture.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(AuthenticationRequest request)
        {
            var response = await _accountService.AuthenticateAsync(request, GenerateIPAddress());
            SetRefreshTokenCookie(response.RefreshToken);
            return Ok(response);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request = null)
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrWhiteSpace(refreshToken))
                refreshToken = request?.RefreshToken;
            if (string.IsNullOrEmpty(refreshToken))
                return BadRequest("Refresh token not found.");
            var response = await _accountService.RefreshTokenAsync(refreshToken, GenerateIPAddress());
            SetRefreshTokenCookie(response.RefreshToken);
            return Ok(response);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("refreshToken");
            return Ok(new { message = "Logged out." });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            var roles = User.FindAll(ClaimTypes.Role)
                .Select(claim => claim.Value)
                .Distinct()
                .ToList();

            var userName = User.Claims.FirstOrDefault(claim => claim.Type == ClaimTypes.Name || claim.Type == "sub")?.Value;
            var email = User.Claims.FirstOrDefault(claim => claim.Type == ClaimTypes.Email || claim.Type == "email")?.Value;

            return Ok(new
            {
                id = User.FindFirstValue("uid"),
                userName,
                email,
                roles
            });
        }
        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync(RegisterRequest request)
        {
            var origin = Request.Headers["origin"];
            return Ok(await _accountService.RegisterAsync(request, origin));
        }
        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmailAsync([FromQuery] string userId, [FromQuery] string code)
        {
            var origin = Request.Headers["origin"].FirstOrDefault() ?? "https://localhost:9001";
            return Ok(await _accountService.ConfirmEmailAsync(userId, code));
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest model)
        {
            var origin = Request.Headers["origin"].FirstOrDefault() ?? "https://localhost:9001";
            await _accountService.ForgotPassword(model, origin);
            return Ok("If an account with that email exists, a reset link has been sent.");
        }
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordRequest model)
        {

            return Ok(await _accountService.ResetPassword(model));
        }
        private string GenerateIPAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"];
            else
                return HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
        }

        private void SetRefreshTokenCookie(string token)
        {
            Response.Cookies.Append("refreshToken", token, new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                SameSite = SameSiteMode.Strict,
                Secure = Request.IsHttps
            });
        }
    }
}
