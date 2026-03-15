using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Infrastructure.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Infrastructure.Contexts
{
    /// <summary>
    /// This is the "Heart" of our database connection.
    /// It maps our C# classes (Entities) to the actual tables in PostgreSQL (Supabase).
    /// If you add a new table to the database, you must register it here.
    /// </summary>
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        private readonly IDateTimeService _dateTime;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IDateTimeService dateTime, IAuthenticatedUserService authenticatedUser) : base(options)
        {
            ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
            _dateTime = dateTime;
            _authenticatedUser = authenticatedUser;
        }

        // Below are the tables currently in our database:
        public DbSet<Tag> Tags { get; set; }             // Tag (Label) table
        public DbSet<RouteTag> RouteTags { get; set; }   // Bridge: Route <-> Tag (many-to-many)
        public DbSet<Spot> Spots { get; set; }          // Spot (Place) table
        public DbSet<Route> Routes { get; set; }        // Route table
        public DbSet<RouteSpot> RouteSpots { get; set; } // Junction table for Routes and Spots
        public DbSet<Collection> Collections { get; set; }
        public DbSet<CollectionRoute> CollectionRoutes { get; set; }
        public DbSet<RouteRating> RouteRatings { get; set; }
        public DbSet<SpotRating> SpotRatings { get; set; }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            foreach (var entry in ChangeTracker.Entries<AuditableBaseEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.Created = _dateTime.NowUtc;
                        entry.Entity.CreatedBy = _authenticatedUser.UserId;
                        break;
                    case EntityState.Modified:
                        entry.Entity.LastModified = _dateTime.NowUtc;
                        entry.Entity.LastModifiedBy = _authenticatedUser.UserId;
                        break;
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }
        protected override void OnModelCreating(ModelBuilder builder)
        {

            builder.Entity<ApplicationUser>(entity =>
            {
                entity.ToTable(name: "User");
                entity.OwnsMany(u => u.RefreshTokens);
            });

            // Many-to-many: Route <-> Tag (via RouteTag bridge table)
            builder.Entity<RouteTag>()
                .HasKey(rt => new { rt.RouteId, rt.TagId });

            builder.Entity<RouteSpot>()
                .HasKey(rs => new { rs.RouteId, rs.SpotId });

            builder.Entity<CollectionRoute>()
                .HasKey(cr => new { cr.CollectionId, cr.RouteId });

            builder.Entity<IdentityRole>(entity =>
            {
                entity.ToTable(name: "Role");
            });
            builder.Entity<IdentityUserRole<string>>(entity =>
            {
                entity.ToTable("UserRoles");
            });

            builder.Entity<IdentityUserClaim<string>>(entity =>
            {
                entity.ToTable("UserClaims");
            });

            builder.Entity<IdentityUserLogin<string>>(entity =>
            {
                entity.ToTable("UserLogins");
            });

            builder.Entity<IdentityRoleClaim<string>>(entity =>
            {
                entity.ToTable("RoleClaims");

            });

            builder.Entity<IdentityUserToken<string>>(entity =>
            {
                entity.ToTable("UserTokens");
            });

            //All Decimals will have 18,6 Range
            foreach (var property in builder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
            {
                property.SetColumnType("decimal(18,6)");
            }
            base.OnModelCreating(builder);
        }
    }
}
