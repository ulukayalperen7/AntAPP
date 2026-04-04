using Ant.Application.Exceptions;
using Ant.Core.Exceptions;
using Ant.Application.Interfaces;
using Ant.Infrastructure.Models;
using Microsoft.AspNetCore.Identity;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Services
{
    public class IdentityService : IIdentityService
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public IdentityService(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<UserIdentityDto> GetUserIdentityAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                throw new EntityNotFoundException(nameof(ApplicationUser), userId);

            var roles = await _userManager.GetRolesAsync(user);

            return new UserIdentityDto
            {
                Email = user.Email,
                IsVerified = user.EmailConfirmed,
                Roles = roles.ToList()
            };
        }

        public async Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                throw new EntityNotFoundException(nameof(ApplicationUser), userId);

            var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
            if (!result.Succeeded)
                throw new ApiException(string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }
}
