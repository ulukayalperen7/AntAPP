using CleanArchitecture.Core.Enums;
using CleanArchitecture.Infrastructure.Models;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;

namespace CleanArchitecture.Infrastructure.Seeds
{
    public static class DefaultRoles
    {
        public static async Task SeedAsync(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            //Seed Roles
            await CreateRoleIfMissing(roleManager, Roles.SuperAdmin.ToString());
            await CreateRoleIfMissing(roleManager, Roles.Admin.ToString());
            await CreateRoleIfMissing(roleManager, Roles.Moderator.ToString());
            await CreateRoleIfMissing(roleManager, Roles.Basic.ToString());
        }

        private static async Task CreateRoleIfMissing(RoleManager<IdentityRole> roleManager, string roleName)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }
    }
}
