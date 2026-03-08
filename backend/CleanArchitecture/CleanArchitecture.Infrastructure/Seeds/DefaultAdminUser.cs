using CleanArchitecture.Core.Enums;
using CleanArchitecture.Infrastructure.Models;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;

namespace CleanArchitecture.Infrastructure.Seeds
{
    public static class DefaultAdminUser
    {
        public static async Task SeedAsync(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            var user = await userManager.FindByEmailAsync("admin@antapp.local");
            if (user != null) return;

            var defaultUser = new ApplicationUser
            {
                UserName = "admin",
                Email = "admin@antapp.local",
                FirstName = "Ant",
                LastName = "Admin",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true
            };

            var result = await userManager.CreateAsync(defaultUser, "123Pa$$word!");
            if (!result.Succeeded) return;

            await userManager.AddToRoleAsync(defaultUser, Roles.Basic.ToString());
            await userManager.AddToRoleAsync(defaultUser, Roles.Admin.ToString());
        }
    }
}
