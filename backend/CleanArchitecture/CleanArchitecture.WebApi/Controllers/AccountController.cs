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
    /// <summary>
    /// Controller for handling user account operations such as login, registration, and password management.
    /// </summary>
    [Route("api/auth")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        /// <summary>
        /// Authenticates a user and returns an access token and a refresh token.
        /// </summary>
        /// <param name="request">The login credentials (email and password).</param>
        /// <returns>Authentication details including the JWT access token and refresh token cookie.</returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login(AuthenticationRequest request)
        {
            // Authenticate the user through the service and get the response containing tokens.
            var response = await _accountService.AuthenticateAsync(request, GenerateIPAddress());
            
            // Set the refresh token in an HTTP-only cookie for better security.
            SetRefreshTokenCookie(response.RefreshToken);
            
            return Ok(response);
        }

        /// <summary>
        /// Refreshes the expired access token using a valid refresh token.
        /// </summary>
        /// <param name="request">Optional request body containing the refresh token (if not in cookies).</param>
        /// <returns>New authentication response with updated tokens.</returns>
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request = null)
        {
            // Try to get the refresh token from the HTTP-only cookie first.
            var refreshToken = Request.Cookies["refreshToken"];
            
            // Fallback to the request body if the cookie is not present.
            if (string.IsNullOrWhiteSpace(refreshToken))
                refreshToken = request?.RefreshToken;
                
            if (string.IsNullOrEmpty(refreshToken))
                return BadRequest("Refresh token not found.");
                
            var response = await _accountService.RefreshTokenAsync(refreshToken, GenerateIPAddress());
            
            // Update the refresh token cookie with the new one.
            SetRefreshTokenCookie(response.RefreshToken);
            
            return Ok(response);
        }

        /// <summary>
        /// Logs out the user by deleting the refresh token cookie.
        /// </summary>
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("refreshToken");
            return Ok(new { message = "Logged out successfully." });
        }

        /// <summary>
        /// Retrieves the current authenticated user's information from the JWT claims.
        /// </summary>
        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            // Extract roles from the claims.
            var roles = User.FindAll(ClaimTypes.Role)
                .Select(claim => claim.Value)
                .Distinct()
                .ToList();

            // Extract basic info like username and email.
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
            // Extract the 'Origin' header to determine the base URL for the confirmation link.
            // If missing, default to a safe fallback (localhost:3000 for standard React/Next.js dev).
            var origin = Request.Headers["origin"].FirstOrDefault() ?? "http://localhost:3000";
            
            var result = await _accountService.RegisterAsync(request, origin);
            
            // Return as an object so it is serialized as JSON, preventing parsing errors on the frontend.
            return Ok(new { message = result });
        }

        /// <summary>
        /// Confirms a user's email address using the userId and a generated confirmation code.
        /// </summary>
        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmailAsync([FromQuery] string userId, [FromQuery] string code)
        {
            return Ok(await _accountService.ConfirmEmailAsync(userId, code));
        }

        /// <summary>
        /// Initiates the password reset process by sending a token to the user's email.
        /// </summary>
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest model)
        {
            var origin = Request.Headers["origin"].FirstOrDefault() ?? "http://localhost:3000";
            await _accountService.ForgotPassword(model, origin);
            return Ok("If an account with that email exists, a reset link has been sent.");
        }

        /// <summary>
        /// Resets the user's password using a valid token.
        /// </summary>
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordRequest model)
        {
            return Ok(await _accountService.ResetPassword(model));
        }

        /// <summary>
        /// Generates or retrieves the client's IP address for security tracking and token generation.
        /// </summary>
        private string GenerateIPAddress()
        {
            // Check for X-Forwarded-For header in case of proxies (like Nginx or Cloudflare).
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"];
            else
                return HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
        }

        /// <summary>
        /// Appends a secure, HTTP-only refresh token cookie to the response.
        /// </summary>
        private void SetRefreshTokenCookie(string token)
        {
            Response.Cookies.Append("refreshToken", token, new CookieOptions
            {
                HttpOnly = true, // Prevent client-side JS from accessing the token (mitigates XSS).
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                SameSite = SameSiteMode.Strict, // Mitigates CSRF attacks.
                Secure = Request.IsHttps // Only send over HTTPS in production.
            });
        }
    }
}
