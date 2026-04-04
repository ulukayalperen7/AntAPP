using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces
{
    public class UserIdentityDto
    {
        public string Email { get; set; }
        public bool IsVerified { get; set; }
        public List<string> Roles { get; set; }
    }

    public interface IIdentityService
    {
        Task<UserIdentityDto> GetUserIdentityAsync(Guid userId);
        Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
    }
}
