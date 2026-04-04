using Ant.Application.DTOs.Account;
using Ant.Core.Entities;
using Ant.Core.Enums;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace Ant.Infrastructure.Models
{
    // for authentication 
    public class ApplicationUser : IdentityUser<Guid>
    {
        public UserTypeEnum UserType { get; set; }
        public virtual User User { get; set; }
        public List<RefreshToken> RefreshTokens { get; set; }

        public bool OwnsToken(string token)
        {
            return this.RefreshTokens?.Find(x => x.Token == token) != null;
        }
    }
}
