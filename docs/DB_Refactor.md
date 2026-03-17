# Backend Changes - User Domain Model Refactor

This document outlines the changes made to introduce a domain-specific `User` entity and align the authentication (`ApplicationUser`) with the core domain model in a Clean Architecture context.

## 1. New Domain Entity: `User`

- A new domain entity `User.cs` was created under `backend/CleanArchitecture/CleanArchitecture.Application/Entities/`.
- This `User` entity holds domain-specific user information (e.g., `UserName`, `ProfilePhotoUrl`, `UserTypeEnum`).
- It inherits from `BaseEntity` (providing a `Guid Id`).

## 2. Updated Domain Entities for User Relationships

The following entities were updated to establish `virtual User` navigation properties, replacing direct `Guid UserId` references with a richer domain relationship:

- **`backend/CleanArchitecture/CleanArchitecture.Application/Entities/SpotRating.cs`**:
    - Added `public virtual User User { get; set; }`
- **`backend/CleanArchitecture/CleanArchitecture.Application/Entities/RouteRating.cs`**:
    - Added `public virtual User User { get; set; }`
- **`backend/CleanArchitecture/CleanArchitecture.Application/Entities/Collection.cs`**:
    - Added `public virtual User User { get; set; }`
- **`backend/CleanArchitecture/CleanArchitecture.Application/Entities/Route.cs`**:
    - Added `public virtual User AuthorUser { get; set; }`

## 3. Refactor of `ApplicationUser` and ASP.NET Core Identity Configuration

To enable a clean 1:1 mapping between `ApplicationUser` (authentication/infrastructure) and `User` (domain/core), and to remove redundant fields, significant changes were made:

- **`backend/CleanArchitecture/CleanArchitecture.Application/Entities/User.cs`**:
    - The `IdentityUserId` string field was removed, as the domain `User.Id` (Guid) now directly corresponds to `ApplicationUser.Id`.
- **`backend/CleanArchitecture/CleanArchitecture.Infrastructure/Models/ApplicationUser.cs`**:
    - Changed base class from `IdentityUser` to `IdentityUser<Guid>` to use `Guid` as the primary key type.
    - Removed redundant domain-specific properties: `ProfilePhotoUrl` and `UserType`.
    - Added `public virtual User User { get; set; }` for the 1:1 navigation to the domain `User` entity.
- **`backend/CleanArchitecture/CleanArchitecture.Infrastructure/Contexts/ApplicationDbContext.cs`**:
    - Updated base class from `IdentityDbContext<ApplicationUser>` to `IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>` to reflect the `Guid` key type for Identity entities.
    - Modified `ApplicationUser` entity configuration to establish a one-to-one relationship with the `User` entity using `Id` as the shared primary key:
        entity.HasOne(u => u.User)
            .WithOne()
            .HasForeignKey<User>(u => u.Id)
            .HasPrincipalKey<ApplicationUser>(u => u.Id)
            .OnDelete(DeleteBehavior.Cascade);
        Removed entity.HasIndex(u => u.IdentityUserId).IsUnique(); from User entity configuration.
Updated IdentityRole, IdentityUserRole, IdentityUserClaim, IdentityUserLogin, IdentityRoleClaim, and IdentityUserToken entity configurations to use Guid as their key type.
backend/CleanArchitecture/CleanArchitecture.Infrastructure/ServiceRegistration.cs:
Updated services.AddIdentity call to use IdentityRole<Guid>:
        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>().AddEntityFrameworkStores<ApplicationDbContext>().AddDefaultTokenProviders();
backend/CleanArchitecture/CleanArchitecture.Infrastructure/Services/AccountService.cs:
Updated RoleManager to use IdentityRole<Guid>.
Modified ApplicationUser instantiation during registration to use Guid for Id.
Removed IdentityUserId assignment from the domain User creation.
Ensured response.Id and JWT uid claim correctly use user.Id.ToString().
Updated ConfirmEmailAsync to use user.Id.ToString() for the userId parameter.
4. Removal of AuditableBaseEntity and Manual Auditing
The AuditableBaseEntity was removed to simplify the entity inheritance hierarchy and move timestamping to a more explicit mechanism.
backend/CleanArchitecture/CleanArchitecture.Application/Entities/AuditableBaseEntity.cs:
This file was conceptually removed, and its properties (CreatedBy, Created, LastModifiedBy, LastModified) were explicitly added to entities that require them.
backend/CleanArchitecture/CleanArchitecture.Application/Entities/Route.cs:
Added public DateTime CreatedAt { get; set; } and public DateTime UpdatedAt { get; set; }.
backend/CleanArchitecture/CleanArchitecture.Application/Entities/Collection.cs:
Added public DateTime CreatedAt { get; set; } and public DateTime UpdatedAt { get; set; }.
backend/CleanArchitecture/CleanArchitecture.Application/Entities/Spot.cs:
Added public DateTime CreatedAt { get; set; } and public DateTime UpdatedAt { get; set; }.
backend/CleanArchitecture/CleanArchitecture.Infrastructure/Contexts/ApplicationDbContext.cs:
The SaveChangesAsync override was updated to remove the foreach (var entry in ChangeTracker.Entries<AuditableBaseEntity>()) loop.
A new private void SetTimestamps<TEntity>(IEnumerable<EntityEntry<TEntity>> entries) where TEntity : class helper method was introduced.
Calls to SetTimestamps were added for Route, Collection, and Spot entities within SaveChangesAsync.
Added using Microsoft.EntityFrameworkCore.ChangeTracking; and using System.Collections.Generic; directives.
5. Entity Framework Core Migration
A new migration named AlignIdentityUserWithDomainUser was generated. This migration handles:
Dropping ProfilePhotoUrl and UserType columns from AspNetUsers table.
Altering the column types of all Identity-related primary and foreign keys from text to uuid (Guid).
Creating the new Users table (for the domain User entity) with a 1:1 foreign key to AspNetUsers.


Important Note: This migration may result in data loss if applied to a database with existing users. A thorough review of the generated migration and backup procedures are recommended before applying it to a production or development database with data.
```