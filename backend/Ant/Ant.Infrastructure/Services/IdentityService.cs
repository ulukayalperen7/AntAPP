using Ant.Application.Exceptions;
using Ant.Core.Exceptions;
using Ant.Application.Interfaces;
using Ant.Infrastructure.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Services
{
    public class IdentityService : IIdentityService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly Ant.Infrastructure.Contexts.ApplicationDbContext _dbContext;

        public IdentityService(UserManager<ApplicationUser> userManager, Ant.Infrastructure.Contexts.ApplicationDbContext dbContext)
        {
            _userManager = userManager;
            _dbContext = dbContext;
        }

        public async Task<UserIdentityDto> GetUserIdentityAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                throw new EntityNotFoundException(nameof(ApplicationUser), userId);

            var roles = await _userManager.GetRolesAsync(user);
            var domainUser = await _dbContext.DomainUsers
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == user.Id);

            return new UserIdentityDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                ProfilePhotoUrl = domainUser?.ProfilePhotoUrl,
                IsVerified = user.EmailConfirmed,
                IsActive = user.LockoutEnd == null || user.LockoutEnd <= DateTimeOffset.UtcNow,
                Roles = roles.ToList()
            };
        }

        public async Task<IEnumerable<UserIdentityDto>> GetAllUsersAsync()
        {
            var users = await _dbContext.Users
                .AsNoTracking()
                .Include(user => user.User)
                .ToListAsync();
            var roleNamesById = await _dbContext.Roles.AsNoTracking()
                .ToDictionaryAsync(role => role.Id, role => role.Name);
            var roleNamesByUserId = await _dbContext.UserRoles.AsNoTracking()
                .GroupBy(userRole => userRole.UserId)
                .ToDictionaryAsync(
                    group => group.Key,
                    group => group
                        .Select(userRole => roleNamesById.GetValueOrDefault(userRole.RoleId))
                        .Where(roleName => !string.IsNullOrWhiteSpace(roleName))
                        .ToList());

            return users.Select(user => new UserIdentityDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                ProfilePhotoUrl = user.User?.ProfilePhotoUrl,
                IsVerified = user.EmailConfirmed,
                IsActive = user.LockoutEnd == null || user.LockoutEnd <= DateTimeOffset.UtcNow,
                Roles = roleNamesByUserId.GetValueOrDefault(user.Id) ?? new List<string>()
            }).ToList();
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

        public async Task<int> GetCountAsync(bool? isActive = null)
        {
            var query = _userManager.Users;
            if (isActive.HasValue)
            {
                var now = DateTimeOffset.UtcNow;
                if (isActive.Value)
                {
                    query = query.Where(u => u.LockoutEnd == null || u.LockoutEnd <= now);
                }
                else
                {
                    query = query.Where(u => u.LockoutEnd != null && u.LockoutEnd > now);
                }
            }
            return await query.CountAsync();
        }
    }
}
