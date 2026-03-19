using CleanArchitecture.Core.DTOs.Account;
using CleanArchitecture.Core.DTOs.Email;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Enums;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Settings;
using CleanArchitecture.Core.Wrappers;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Helpers;
using CleanArchitecture.Infrastructure.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
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

namespace CleanArchitecture.Infrastructure.Services
{
    /// <summary>
    /// Implementation of the IAccountService interface for managing user accounts, 
    /// authentication, and role-based access control.
    /// </summary>
    public class AccountService : IAccountService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IEmailService _emailService;
        private readonly JWTSettings _jwtSettings;
        private readonly IDateTimeService _dateTimeService;
        private readonly ApplicationDbContext _dbContext;

        public AccountService(UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole<Guid>> roleManager,
            IOptions<JWTSettings> jwtSettings,
            IDateTimeService dateTimeService,
            SignInManager<ApplicationUser> signInManager,
            IEmailService emailService,
            ApplicationDbContext dbContext)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtSettings = jwtSettings.Value;
            _dateTimeService = dateTimeService;
            _signInManager = signInManager;
            this._emailService = emailService;
            _dbContext = dbContext;
        }

        /// <summary>
        /// Authenticates a user by checking email and password. Generates JWT and Refresh tokens if successful.
        /// </summary>
        /// <param name="request">The login request data.</param>
        /// <param name="ipAddress">The IP address of the client for tracking tokens.</param>
        /// <returns>Authentication response with tokens and user details.</returns>
        public async Task<AuthenticationResponse> AuthenticateAsync(AuthenticationRequest request, string ipAddress)
        {
            // 1. Find the user by their email address.
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                throw new ApiException($"No Accounts Registered with {request.Email}.");
            }

            // 2. Attempt to sign in using the UserName and Password. 
            // We use PasswordSignInAsync which also handles things like lockout logic.
            var result = await _signInManager.PasswordSignInAsync(user.UserName, request.Password, false, lockoutOnFailure: false);
            if (!result.Succeeded)
            {
                throw new ApiException($"Invalid Credentials for '{request.Email}'.");
            }

            // 3. Ensure the user has confirmed their email address before allowing login.
            if (!user.EmailConfirmed)
            {
                throw new ApiException($"Account Not Confirmed for '{request.Email}'.");
            }

            // 4. Generate the JWT (Access Token).
            JwtSecurityToken jwtSecurityToken = await GenerateJWToken(user);
            
            AuthenticationResponse response = new AuthenticationResponse();
            response.Id = user.Id.ToString();
            response.JWToken = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken);
            response.Email = user.Email;
            response.UserName = user.UserName;
            
            // 5. Retrieve user roles to include in the response for frontend routing check.
            var rolesList = await _userManager.GetRolesAsync(user).ConfigureAwait(false);
            response.Roles = rolesList.ToList();
            response.IsVerified = user.EmailConfirmed;

            // 6. Generate and save a Refresh Token. 
            // Refresh tokens are longer-lived and used to get new Access Tokens without re-prompting for password.
            var refreshToken = GenerateRefreshToken(ipAddress);
            response.RefreshToken = refreshToken.Token;

            // 7. Update the user record with the new refresh token.
            var trackedUser = await _userManager.Users
                .AsTracking()
                .Include(u => u.RefreshTokens)
                .SingleAsync(u => u.Id == user.Id);
            trackedUser.RefreshTokens ??= new List<RefreshToken>();
            trackedUser.RefreshTokens.Add(refreshToken);
            await _userManager.UpdateAsync(trackedUser);

            return response;
        }

        /// <summary>
        /// Refreshes the Access Token using a valid, non-expired Refresh Token.
        /// </summary>
        public async Task<AuthenticationResponse> RefreshTokenAsync(string token, string ipAddress)
        {
            // 1. Find the user who owns this refresh token.
            var user = await _userManager.Users
                .AsTracking()
                .Include(u => u.RefreshTokens)
                .SingleOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == token));

            if (user == null) throw new ApiException("Invalid token.");

            // 2. Validate the refresh token (check if it has been revoked or expired).
            var refreshToken = user.RefreshTokens.Single(x => x.Token == token);
            if (!refreshToken.IsActive) throw new ApiException("Invalid token.");

            // 3. Create a new Refresh Token (Token Rotation) for better security.
            var newRefreshToken = GenerateRefreshToken(ipAddress);
            refreshToken.Revoked = DateTime.UtcNow;
            refreshToken.RevokedByIp = ipAddress;
            refreshToken.ReplacedByToken = newRefreshToken.Token;
            user.RefreshTokens.Add(newRefreshToken);
            await _userManager.UpdateAsync(user);

            // 4. Generate the new JWT Access Token.
            var jwtSecurityToken = await GenerateJWToken(user);
            var rolesList = await _userManager.GetRolesAsync(user);
            
            return new AuthenticationResponse
            {
                Id = user.Id.ToString(),
                JWToken = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken),
                Email = user.Email,
                UserName = user.UserName,
                IsVerified = user.EmailConfirmed,
                RefreshToken = newRefreshToken.Token,
                Roles = rolesList.ToList()
            };
        }

        /// <summary>
        /// Registers a new user, adds them to a role, creates a domain user record, and generates a verification link.
        /// </summary>
        public async Task<string> RegisterAsync(RegisterRequest request, string origin)
        {
            // 1. Check if the username is already taken.
            var userWithSameUserName = await _userManager.FindByNameAsync(request.UserName);
            if (userWithSameUserName != null)
            {
                throw new ApiException($"Username '{request.UserName}' is already taken.");
            }

            // 2. Initialize the Identity User (ApplicationUser).
            var userId = Guid.NewGuid();
            var user = new ApplicationUser
            {
                Id = userId,
                Email = request.Email,
                UserName = request.UserName,
                UserType = request.UserType,
                EmailConfirmed = true // Auto-confirm for instant access during development.
            };

            // 3. Initialize the Domain User (The "business" User entity).
            var domainUser = new User
            {
                Id = userId,
                UserName = request.UserName
            };

            // 4. Check for duplicate email.
            var userWithSameEmail = await _userManager.FindByEmailAsync(request.Email);
            if (userWithSameEmail == null)
            {
                // 5. Create the user in Identity database.
                var result = await _userManager.CreateAsync(user, request.Password);
                if (result.Succeeded)
                {
                    try
                    {
                        // 6. Create the corresponding record in the domain Users table.
                        _dbContext.DomainUsers.Add(domainUser);
                        await _dbContext.SaveChangesAsync();
                    }
                    catch
                    {
                        // Rollback: If domain user creation fails, delete the Identity user.
                        await _userManager.DeleteAsync(user);
                        throw;
                    }

                    // 7. Assign the appropriate role based on UserType.
                    var roleName = request.UserType switch
                    {
                        UserTypeEnum.BusinessUser => RoleNames.BusinessUser,
                        UserTypeEnum.Admin => RoleNames.BasicUser, // Note: Defaulting Admin to Basic for safety here.
                        _ => RoleNames.BasicUser,
                    };
                    await _userManager.AddToRoleAsync(user, roleName);

                    // Note: We are currently auto-confirming users for a smoother developer experience.
                    // If you want to enable email verification in the future, uncomment the lines below:
                    /*
                    var verificationUri = await SendVerificationEmail(user, origin);
                    return $"User Registered. Please confirm your account by visiting this URL: {verificationUri}";
                    */

                    return "Account created successfully! You can now sign in.";
                }
                else
                {
                    // If Identity creation fails, return all errors joined by comma.
                    throw new ApiException(string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
            else
            {
                throw new ApiException($"Email {request.Email} is already registered.");
            }
        }

        /// <summary>
        /// Generates a JWT (Json Web Token) containing user claims and roles.
        /// </summary>
        private async Task<JwtSecurityToken> GenerateJWToken(ApplicationUser user)
        {
            var userClaims = await _userManager.GetClaimsAsync(user);
            var roles = await _userManager.GetRolesAsync(user);
            var roleClaims = roles.Select(role => new Claim(ClaimTypes.Role, role)).ToList();

            string ipAddress = IpHelper.GetIpAddress();

            // Core claims that will be encoded into the token.
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

        /// <summary>
        /// Generates a random 40-byte hex string to be used as a Refresh Token.
        /// </summary>
        private string RandomTokenString()
        {
            var randomBytes = new byte[40];
            System.Security.Cryptography.RandomNumberGenerator.Fill(randomBytes);
            return BitConverter.ToString(randomBytes).Replace("-", "");
        }

        /// <summary>
        /// Creates an email confirmation token and builds the full URL for verification.
        /// </summary>
        private async Task<string> SendVerificationEmail(ApplicationUser user, string origin)
        {
            // Generate a token that can only be used once to confirm this user's email.
            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            
            // Encode the token for use in a URL.
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
            
            var route = "api/auth/confirm-email/";
            var endpointUri = new Uri(string.Concat($"{origin}/", route));
            
            // Add query parameters for the userId and the confirmation code.
            var verificationUri = QueryHelpers.AddQueryString(endpointUri.ToString(), "userId", user.Id.ToString());
            verificationUri = QueryHelpers.AddQueryString(verificationUri, "code", code);
            
            return verificationUri;
        }

        /// <summary>
        /// Validates the confirmation code and marks the user's email as confirmed.
        /// </summary>
        public async Task<string> ConfirmEmailAsync(string userId, string code)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) throw new ApiException("User not found.");

            // Decode the token back to its original form.
            code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
            
            // Confirm the email via Identity's UserManager.
            var result = await _userManager.ConfirmEmailAsync(user, code);
            if (result.Succeeded)
            {
                return $"Account Confirmed for {user.Email}. You can now log in.";
            }
            else
            {
                throw new ApiException($"An error occurred while confirming {user.Email}.");
            }
        }

        /// <summary>
        /// Generates a new RefreshToken object with a 7-day expiration.
        /// </summary>
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

        /// <summary>
        /// Generates a password reset token and "would" send it via email.
        /// </summary>
        public async Task ForgotPassword(ForgotPasswordRequest model, string origin)
        {
            var account = await _userManager.FindByEmailAsync(model.Email);
            if (account == null) return;

            var code = await _userManager.GeneratePasswordResetTokenAsync(account);
            var emailRequest = new EmailRequest()
            {
                Body = $"Your password reset token is: {code}",
                To = model.Email,
                Subject = "Reset Password",
            };
            
            // Try to send the real email if the SMTP service is configured.
            try { await _emailService.SendAsync(emailRequest); } catch { }
        }

        /// <summary>
        /// Validates the reset token and updates the user's password.
        /// </summary>
        public async Task<string> ResetPassword(ResetPasswordRequest model)
        {
            var account = await _userManager.FindByEmailAsync(model.Email);
            if (account == null) throw new ApiException($"No Accounts Registered with {model.Email}.");
            
            var result = await _userManager.ResetPasswordAsync(account, model.Token, model.Password);
            if (result.Succeeded)
            {
                return "Password Reset Successful.";
            }
            else
            {
                throw new ApiException("Error occurred while resetting the password.");
            }
        }
    }
}
