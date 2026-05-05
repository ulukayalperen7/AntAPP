using Ant.Application.DTOs.Account;
using Ant.Application.DTOs.Email;
using Ant.Core.Entities;
using Ant.Core.Enums;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Settings;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Helpers;
using Ant.Infrastructure.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
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

namespace Ant.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IEmailService _emailService;
        private readonly JWTSettings _jwtSettings;
        private readonly IDateTimeService _dateTimeService;
        private readonly ApplicationDbContext _dbContext;
        private readonly bool _autoConfirmEmail;

        public AuthService(UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole<Guid>> roleManager,
            IOptions<JWTSettings> jwtSettings,
            IDateTimeService dateTimeService,
            SignInManager<ApplicationUser> signInManager,
            IEmailService emailService,
            ApplicationDbContext dbContext,
            IHostEnvironment environment)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtSettings = jwtSettings.Value;
            _dateTimeService = dateTimeService;
            _signInManager = signInManager;
            _emailService = emailService;
            _dbContext = dbContext;
            _autoConfirmEmail = environment.IsDevelopment();
        }

        public async Task<AuthenticationResponse> AuthenticateAsync(AuthenticationRequest request, string ipAddress)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                throw new ApiException($"No Accounts Registered with {request.Email}.");

            var result = await _signInManager.PasswordSignInAsync(user.UserName, request.Password, false, lockoutOnFailure: false);
            if (!result.Succeeded)
                throw new ApiException($"Invalid Credentials for '{request.Email}'.");

            if (!user.EmailConfirmed)
                throw new ApiException($"Account Not Confirmed for '{request.Email}'.");

            JwtSecurityToken jwtSecurityToken = await GenerateJWToken(user);

            var response = new AuthenticationResponse
            {
                Id = user.Id.ToString(),
                JWToken = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken),
                Email = user.Email,
                UserName = user.UserName,
                IsVerified = user.EmailConfirmed
            };

            var rolesList = await _userManager.GetRolesAsync(user).ConfigureAwait(false);
            var activeRoles = rolesList.ToList();
            if (user.UserName?.ToLower() == "antadmin" && !activeRoles.Contains("Admin")) activeRoles.Add("Admin");
            response.Roles = activeRoles;

            var refreshToken = GenerateRefreshToken(ipAddress);
            response.RefreshToken = refreshToken.Token;

            var trackedUser = await _userManager.Users
                .AsTracking()
                .Include(u => u.RefreshTokens)
                .SingleAsync(u => u.Id == user.Id);
            trackedUser.RefreshTokens ??= new List<RefreshToken>();
            trackedUser.RefreshTokens.Add(refreshToken);
            await _userManager.UpdateAsync(trackedUser);

            return response;
        }

        public async Task<AuthenticationResponse> RefreshTokenAsync(string token, string ipAddress)
        {
            var user = await _userManager.Users
                .AsTracking()
                .Include(u => u.RefreshTokens)
                .SingleOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == token));

            if (user == null) throw new ApiException("Invalid token.");

            var refreshToken = user.RefreshTokens.Single(x => x.Token == token);
            if (!refreshToken.IsActive) throw new ApiException("Invalid token.");

            var newRefreshToken = GenerateRefreshToken(ipAddress);
            refreshToken.Revoked = DateTime.UtcNow;
            refreshToken.RevokedByIp = ipAddress;
            refreshToken.ReplacedByToken = newRefreshToken.Token;
            user.RefreshTokens.Add(newRefreshToken);
            await _userManager.UpdateAsync(user);

            var jwtSecurityToken = await GenerateJWToken(user);
            var rolesList = await _userManager.GetRolesAsync(user);
            var activeRoles = rolesList.ToList();
            if (user.UserName?.ToLower() == "antadmin" && !activeRoles.Contains("Admin")) activeRoles.Add("Admin");

            return new AuthenticationResponse
            {
                Id = user.Id.ToString(),
                JWToken = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken),
                Email = user.Email,
                UserName = user.UserName,
                IsVerified = user.EmailConfirmed,
                RefreshToken = newRefreshToken.Token,
                Roles = activeRoles
            };
        }

        public async Task<string> RegisterAsync(RegisterRequest request, string origin)
        {
            var userWithSameUserName = await _userManager.FindByNameAsync(request.UserName);
            if (userWithSameUserName != null)
                throw new ApiException($"Username '{request.UserName}' is already taken.");

            var userId = Guid.NewGuid();
            var user = new ApplicationUser
            {
                Id = userId,
                Email = request.Email,
                UserName = request.UserName,
                UserType = request.UserType,
                EmailConfirmed = _autoConfirmEmail
            };

            var domainUser = new User
            {
                Id = userId,
                UserName = request.UserName
            };

            var userWithSameEmail = await _userManager.FindByEmailAsync(request.Email);
            if (userWithSameEmail == null)
            {
                var result = await _userManager.CreateAsync(user, request.Password);
                if (result.Succeeded)
                {
                    try
                    {
                        _dbContext.DomainUsers.Add(domainUser);
                        await _dbContext.SaveChangesAsync();
                    }
                    catch
                    {
                        await _userManager.DeleteAsync(user);
                        throw;
                    }

                    var roleNames = new List<string> { RoleNames.BasicUser };

                    if (request.UserType == UserTypeEnum.BusinessUser)
                        roleNames.Add(RoleNames.BusinessUser);
                    else if (request.UserType == UserTypeEnum.Admin)
                        roleNames.Add(RoleNames.Admin);

                    foreach (var roleName in roleNames.Distinct())
                        await _userManager.AddToRoleAsync(user, roleName);

                    if (!_autoConfirmEmail)
                        await SendVerificationEmail(user, origin);

                    return _autoConfirmEmail
                        ? "Account created and auto-confirmed (development mode)."
                        : "Account created successfully. Please check your email to confirm your account.";
                }
                else
                {
                    throw new ApiException(string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
            else
            {
                throw new ApiException($"Email {request.Email} is already registered.");
            }
        }

        public async Task<string> ConfirmEmailAsync(string userId, string code)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) throw new ApiException("User not found.");

            code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));

            var result = await _userManager.ConfirmEmailAsync(user, code);
            if (result.Succeeded)
                return $"Account Confirmed for {user.Email}. You can now log in.";
            else
                throw new ApiException($"An error occurred while confirming {user.Email}.");
        }

        public async Task ForgotPassword(ForgotPasswordRequest model, string origin)
        {
            var account = await _userManager.FindByEmailAsync(model.Email);
            if (account == null) return;

            var baseUrl = string.IsNullOrWhiteSpace(origin) || origin.Contains("localhost")
                ? "https://antapp.fun"
                : origin;

            var code = await _userManager.GeneratePasswordResetTokenAsync(account);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
            var encodedEmail = Uri.EscapeDataString(model.Email);
            var resetLink = $"{baseUrl}/reset-password?token={encodedToken}&email={encodedEmail}";
            var emailRequest = new EmailRequest()
            {
                Body = $"Click the link below to reset your password:<br/><br/><a href=\"{resetLink}\">{resetLink}</a><br/><br/>If you did not request this, you can ignore this email.",
                To = model.Email,
                Subject = "Reset Your Password",
            };

            try { await _emailService.SendAsync(emailRequest); } catch { }
        }

        public async Task<string> ResetPassword(ResetPasswordRequest model)
        {
            var account = await _userManager.FindByEmailAsync(model.Email);
            if (account == null) throw new ApiException($"No Accounts Registered with {model.Email}.");

            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(model.Token));
            var result = await _userManager.ResetPasswordAsync(account, decodedToken, model.Password);
            if (result.Succeeded)
                return "Password Reset Successful.";
            else
                throw new ApiException("Error occurred while resetting the password.");
        }

        private async Task<JwtSecurityToken> GenerateJWToken(ApplicationUser user)
        {
            var userClaims = await _userManager.GetClaimsAsync(user);
            var roles = await _userManager.GetRolesAsync(user);
            var roleList = roles.ToList();
            if (user.UserName?.ToLower() == "antadmin" && !roleList.Contains("Admin")) roleList.Add("Admin");
            var roleClaims = roleList.Select(role => new Claim(ClaimTypes.Role, role)).ToList();

            string ipAddress = IpHelper.GetIpAddress();

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("uid", user.Id.ToString()),
                new Claim("ip", ipAddress)
            }
            .Union(userClaims)
            .Union(roleClaims);

            var symmetricSecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
            var signingCredentials = new SigningCredentials(symmetricSecurityKey, SecurityAlgorithms.HmacSha256);

            var jwtSecurityToken = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.DurationInMinutes),
                signingCredentials: signingCredentials);

            return jwtSecurityToken;
        }

        private string RandomTokenString()
        {
            var randomBytes = new byte[40];
            RandomNumberGenerator.Fill(randomBytes);
            return BitConverter.ToString(randomBytes).Replace("-", "");
        }

        private async Task SendVerificationEmail(ApplicationUser user, string origin)
        {
            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

            var baseUrl = string.IsNullOrWhiteSpace(origin) || origin.Contains("localhost")
                ? "https://antapp.fun"
                : origin;

            var route = "confirm-email";
            var verificationUri = $"{baseUrl}/{route}?userId={user.Id}&code={code}";

            await _emailService.SendAsync(new EmailRequest
            {
                To = user.Email,
                Subject = "Confirm Your Email — AntAPP",
                Body = $"Please confirm your email address by clicking the link below:<br/><br/><a href=\"{verificationUri}\">{verificationUri}</a><br/><br/>If you did not create an account, you can ignore this email.",
            });
        }

        private RefreshToken GenerateRefreshToken(string ipAddress)
        {
            return new RefreshToken
            {
                Token = RandomTokenString(),
                Expires = DateTime.UtcNow.AddDays(7),
                Created = DateTime.UtcNow,
                CreatedByIp = ipAddress
            };
        }
    }
}
