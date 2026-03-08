namespace CleanArchitecture.Core.Enums
{
    public static class RoleNames
    {
        public const string User = "User";
        public const string Business = "Business";
        public const string Admin = "Admin";

        public static string ToPublicRole(string role)
        {
            return role switch
            {
                nameof(Roles.Basic) => User,
                nameof(Roles.Moderator) => Business,
                nameof(Roles.SuperAdmin) => Admin,
                _ => role
            };
        }
    }
}
