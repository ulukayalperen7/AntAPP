using Ant.Application.Exceptions;
using Ant.Core.Exceptions;
using Ant.Application.Interfaces;
using Ant.Infrastructure.Models;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
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
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                IsVerified = user.EmailConfirmed,
                IsActive = user.LockoutEnd == null || user.LockoutEnd <= DateTimeOffset.UtcNow,
                Roles = roles.ToList()
            };
        }

        public async Task<IEnumerable<UserIdentityDto>> GetAllUsersAsync()
        {
            var users = _userManager.Users.ToList();
            var userList = new List<UserIdentityDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new UserIdentityDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    IsVerified = user.EmailConfirmed,
                    IsActive = user.LockoutEnd == null || user.LockoutEnd <= DateTimeOffset.UtcNow,
                    Roles = roles.ToList()
                });
            }

            return userList;
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

        public async Task UpdateUserRolesAsync(Guid userId, List<string> roles)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                throw new EntityNotFoundException(nameof(ApplicationUser), userId);

            var currentRoles = await _userManager.GetRolesAsync(user);
            
            // Remove existing roles
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
                throw new ApiException("Failed to remove existing roles.");

            // Add new roles
            var addResult = await _userManager.AddToRolesAsync(user, roles);
            if (!addResult.Succeeded)
                throw new ApiException("Failed to add new roles.");
        }

        public async Task UpdateUserStatusAsync(Guid userId, bool isActive)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                throw new EntityNotFoundException(nameof(ApplicationUser), userId);

            // In Identity, 'Lockout' is often used for banning/deactivating
            await _userManager.SetLockoutEnabledAsync(user, !isActive);
            if (!isActive)
            {
                await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
            }
            else
            {
                await _userManager.SetLockoutEndDateAsync(user, null);
            }
        }
    }
}
