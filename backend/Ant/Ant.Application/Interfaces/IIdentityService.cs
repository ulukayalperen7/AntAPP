using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces
{
    public class UserIdentityDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string ProfilePhotoUrl { get; set; }
        public bool IsVerified { get; set; }
        public bool IsActive { get; set; }
        public List<string> Roles { get; set; }
    }

    public interface IIdentityService
    {
        Task<UserIdentityDto> GetUserIdentityAsync(Guid userId);
        Task<IEnumerable<UserIdentityDto>> GetAllUsersAsync();
        Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
        Task UpdateUserRolesAsync(Guid userId, List<string> roles);
        Task UpdateUserStatusAsync(Guid userId, bool isActive);
        Task<int> GetCountAsync(bool? isActive = null);
    }
}
