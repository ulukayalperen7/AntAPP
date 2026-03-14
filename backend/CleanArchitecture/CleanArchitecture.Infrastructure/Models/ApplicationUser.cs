using CleanArchitecture.Core.DTOs.Account;
using CleanArchitecture.Core.Enums;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace CleanArchitecture.Infrastructure.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string ProfilePhotoUrl { get; set; }
        public UserTypeEnum UserType { get; set; }

        public List<RefreshToken> RefreshTokens { get; set; }

        public bool OwnsToken(string token)
        {
            return this.RefreshTokens?.Find(x => x.Token == token) != null;
        }
    }
}
