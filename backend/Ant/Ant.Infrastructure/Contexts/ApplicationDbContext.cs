using Ant.Application.Interfaces;
using Ant.Core.Entities;
using Ant.Infrastructure.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Contexts
{
    /// <summary>
    /// This is the "Heart" of our database connection.
    /// It maps our C# classes (Entities) to the actual tables in PostgreSQL (Supabase).
    /// If you add a new table to the database, you must register it here.
    /// </summary>
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
    {
        private readonly IDateTimeService _dateTime;
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IDateTimeService dateTime, IAuthenticatedUserService authenticatedUser) : base(options)
        {
            ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
            _dateTime = dateTime;
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
        public DbSet<SpotFavorite> SpotFavorites { get; set; }
        public DbSet<User> DomainUsers { get; set; }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            SetTimestamps(ChangeTracker.Entries<Route>());
            SetTimestamps(ChangeTracker.Entries<Collection>());
            SetTimestamps(ChangeTracker.Entries<Spot>());

            return base.SaveChangesAsync(cancellationToken);
        }

        private void SetTimestamps<TEntity>(IEnumerable<EntityEntry<TEntity>> entries) where TEntity : class
        {
            foreach (var entry in entries)
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Property("CreatedAt").CurrentValue = _dateTime.NowUtc;
                        entry.Property("UpdatedAt").CurrentValue = _dateTime.NowUtc;
                        break;
                    case EntityState.Modified:
                        entry.Property("UpdatedAt").CurrentValue = _dateTime.NowUtc;
                        break;
                }
            }
        }
        protected override void OnModelCreating(ModelBuilder builder)
        {

            builder.Entity<ApplicationUser>(entity =>
            {
                entity.ToTable(name: "User");
                entity.OwnsMany(u => u.RefreshTokens);
                entity.HasOne(u => u.User)
                    .WithOne()
                    .HasForeignKey<User>(u => u.Id)
                    .HasPrincipalKey<ApplicationUser>(u => u.Id)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasIndex(u => u.UserName).IsUnique();
            });

            builder.HasPostgresExtension("postgis");
            builder.HasPostgresExtension("pg_trgm");

            builder.Entity<Route>(entity =>
            {
                entity.HasIndex(r => r.CenterLocation).HasMethod("GIST");
                entity.HasIndex(r => new { r.IsDeleted, r.IsPublic, r.CreatedAt });
                entity.HasIndex(r => new { r.AuthorUserId, r.CreatedAt });
                entity.HasIndex(r => r.Title).HasMethod("GIN").HasOperators("gin_trgm_ops");
                entity.HasIndex(r => r.Description).HasMethod("GIN").HasOperators("gin_trgm_ops");
            });

            // Many-to-many: Route <-> Tag (via RouteTag bridge table)
            builder.Entity<RouteTag>()
                .HasKey(rt => new { rt.RouteId, rt.TagId });

            builder.Entity<RouteSpot>(entity =>
            {
                entity.HasKey(rs => rs.Id);
                entity.HasIndex(rs => new { rs.RouteId, rs.SpotOrder }).IsUnique();
            });

            builder.Entity<Spot>(entity =>
            {
                entity.HasOne(s => s.OwnerUser)
                    .WithMany(u => u.OwnedSpots)
                    .HasForeignKey(s => s.OwnerUserId)
                    .OnDelete(DeleteBehavior.SetNull);
                entity.HasIndex(s => s.Location).HasMethod("GIST");
                entity.HasIndex(s => new { s.IsActive, s.CreatedAt });
                entity.HasIndex(s => new { s.OwnerUserId, s.CreatedAt });
                entity.HasIndex(s => s.Name).HasMethod("GIN").HasOperators("gin_trgm_ops");
                entity.HasIndex(s => s.Description).HasMethod("GIN").HasOperators("gin_trgm_ops");
            });

            builder.Entity<CollectionRoute>()
                .HasKey(cr => new { cr.CollectionId, cr.RouteId });

            builder.Entity<Route>()
                .HasOne(r => r.AuthorUser)
                .WithMany(u => u.AuthoredRoutes)
                .HasForeignKey(r => r.AuthorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Collection>()
                .HasOne(c => c.User)
                .WithMany(u => u.Collections)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<RouteRating>()
                .HasOne(rr => rr.User)
                .WithMany(u => u.RouteRatings)
                .HasForeignKey(rr => rr.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<SpotRating>()
                .HasOne(sr => sr.User)
                .WithMany(u => u.SpotRatings)
                .HasForeignKey(sr => sr.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<SpotFavorite>()
                .HasKey(sf => new { sf.UserId, sf.SpotId });

            builder.Entity<SpotFavorite>()
                .HasOne(sf => sf.User)
                .WithMany(u => u.FavoriteSpots)
                .HasForeignKey(sf => sf.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<SpotFavorite>()
                .HasOne(sf => sf.Spot)
                .WithMany(s => s.FavoritedBy)
                .HasForeignKey(sf => sf.SpotId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<IdentityRole<Guid>>(entity =>
            {
                entity.ToTable(name: "Role");
            });
            builder.Entity<IdentityUserRole<Guid>>(entity =>
            {
                entity.ToTable("UserRoles");
            });

            builder.Entity<IdentityUserClaim<Guid>>(entity =>
            {
                entity.ToTable("UserClaims");
            });

            builder.Entity<IdentityUserLogin<Guid>>(entity =>
            {
                entity.ToTable("UserLogins");
            });

            builder.Entity<IdentityRoleClaim<Guid>>(entity =>
            {
                entity.ToTable("RoleClaims");

            });

            builder.Entity<IdentityUserToken<Guid>>(entity =>
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
