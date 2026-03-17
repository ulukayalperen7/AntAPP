using CleanArchitecture.Core.DTOs.Account;
using CleanArchitecture.Core.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace CleanArchitecture.Infrastructure.Models
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public virtual User User { get; set; }
        public List<RefreshToken> RefreshTokens { get; set; }

        public bool OwnsToken(string token)
        {
            return this.RefreshTokens?.Find(x => x.Token == token) != null;
        }
    }
}
