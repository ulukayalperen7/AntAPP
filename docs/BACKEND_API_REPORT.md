# API & Application Architecture Design Report

This document defines the top-level API structure of the system.  
Its purpose is to give frontend developers and other team members a clear understanding of how the backend is organized conceptually.

The API is designed around **resource responsibility** and **role-based usage**.  
Not every role uses every endpoint group in the same way.

---

## Base Principle

The API is divided into logical modules:

- `/auth` = authentication and token flows
- `/account` = current authenticated user’s own account/profile operations
- `/routes` = route discovery, creation, and ownership actions
- `/spots` = public spot viewing and rating, plus spot-related operations
- `/collections` = user-created bundles of routes
- `/tags` = public tag catalog
- `/categories` = public category catalog
- `/business` = business user operations for their own entities and dashboard actions
- `/admin` = administrator-only full system management and moderation
- `/admin/accounts` = administrator-only account management
- `/admin/routes` = administrator-only route management
- `/admin/spots` = administrator-only spot management
- `/admin/collections` = administrator-only collection management
- `/admin/tags` = administrator-only tag management
- `/admin/categories` = administrator-only category management
- `/buiness` = business user operations for their own entities and dashboard actions
- `/buiness/spots` = business user operations for their own spots and dashboard actions
- `/buiness/analytics` = business user operations for their own analytics and dashboard actions

Travel Route Platform (.NET Clean Architecture)

## 1. Overview

This document defines the architectural decisions for:

- API endpoint structure
- Controller organization
- Application layer patterns (Service vs MediatR)
- Feature-based design decisions for:
  - Routes
  - Spots
  - Ratings
  - Tags
  - Collections
  - Auth & Account
  - Business & Admin

The goal is to establish a scalable, maintainable, and consistent architecture aligned with Clean Architecture principles.

## 2. High-Level Architectural Principles

### 2.1 Clean Architecture Layers

```
API (Controllers)
    ↓
Application (Use Cases: Commands / Queries / Services)
    ↓
Domain (Entities, Rules)
    ↓
Infrastructure (DB, External Services)
```

### 2.2 Key Design Rules

- Controllers must be thin (no business logic)
- Application layer defines use cases
- Domain layer contains business rules only
- Infrastructure handles external concerns
## 3. Controller Design Strategy

### 3.1 General Rules

- One controller per domain/use-case group
- Avoid "god controllers"
- Separate User / Business / Admin concerns
- Split controllers when responsibilities diverge

### 3.2 Recommended Controller Structure

```
Controllers
├── AuthController.cs
├── AccountController.cs
├── RoutesController.cs
├── RouteRatingsController.cs
├── SpotsController.cs
├── SpotRatingsController.cs
├── CollectionsController.cs
├── CategoriesController.cs
├── TagsController.cs
├── Business
    ├── BusinessController.cs
    ├── BusinessSpotsController.cs
    ├── BusinessAnalyticsController.cs
└── Admin
    ├── AdminAccountsController.cs
    ├── AdminRoutesController.cs
    ├── AdminSpotsController.cs
    ├── AdminCategoriesController.cs
    ├── AdminCollectionsController.cs
    └── AdminTagsController.cs

```

### 3.3 Responsibility Breakdown

| Controller | Responsibilities |
|---|---|
| **AuthController** | Login / Register / Refresh / Logout / Password reset / Email confirmation |
| **AccountController** | Current user profile / Update account / Change password |
| **RoutesController** | CRUD for routes / Route listing & details / Forking routes |
| **RouteRatingsController** | Add/update/remove rating for routes |
| **SpotsController** | Browse spots / Spot details |
| **SpotRatingsController** | Add/update/remove rating for spots |
| **CollectionsController** | User collections (grouping routes) |
| **TagsController** / **CategoriesController** | Public read access |
| **Business Controllers** | Manage owned spots/routes / Business-specific operations |
| **Admin Controllers** | Full CRUD across system / Moderation & management |
## 4. Service vs MediatR Decision

### 4.1 Decision Principle

Do not decide globally. Decide per feature based on:

- **Complexity** — How intricate is the feature logic?
- **Growth expectation** — Will it expand significantly?
- **Number of use cases** — How many operations exist?
- **Domain importance** — Is it central to the domain?

### 4.2 When to Use Services

Use service pattern when:

- Feature is small and cohesive
- Workflow-oriented (not CRUD-heavy)
- Limited number of operations
- Low expected growth

### 4.3 When to Use MediatR

Use MediatR when:

- Many use cases exist
- Clear separation between read/write operations
- Feature is central to domain
- Expected to grow significantly
- Complex filtering or business rules exist
## 5. Feature-Based Decisions

### 5.1 Auth Module

**Decision:** Use Service Pattern

**Reasoning:**
- Workflow-oriented (login, register, refresh)
- Small and cohesive
- Not CRUD-based
- Simpler implementation

**Example Interface:**

```csharp
public interface IAuthService
{
    Task<LoginResult> LoginAsync(LoginRequest request);
    Task<RegisterResult> RegisterAsync(RegisterRequest request);
    Task<TokenDto> RefreshAsync(string refreshToken);
    Task LogoutAsync(Guid userId);
}
```

### 5.2 Routes Module

**Decision:** Use MediatR

**Reasoning:**
- Core domain feature
- Many use cases
- Complex filtering and operations
- Will grow significantly

**Example Use Cases:**
- `CreateRouteCommand`
- `UpdateRouteCommand`
- `DeleteRouteCommand`
- `GetRouteByIdQuery`
- `GetRoutesQuery`
- `ForkRouteCommand`

### 5.3 Spots Module

**Decision:** Use MediatR

**Reasoning:**
- Similar complexity to routes
- Business ownership involved
- Filtering and browsing required

### 5.4 Ratings Module

**Decision:** Use MediatR

**Reasoning:**
- Part of core domain
- Contains business rules:
  - One rating per user
  - Aggregate calculation
- Likely to evolve into reviews/comments

**Structure Recommendation:**

Attach ratings to parent features:

```
Routes/
  Commands/
    RateRoute
    RemoveRouteRating

Spots/
  Commands/
    RateSpot
    RemoveSpotRating
```

**Future Evolution:**

Ratings may evolve into:
- Reviews (text content)
- Likes/helpful votes
- Reporting/moderation

MediatR supports this evolution cleanly.

### 5.5 Tags Module

**Decision:** Use MediatR (with separation of concerns)

#### 5.5.1 Tag Catalog (Admin)

Simple CRUD:
- `CreateTagCommand`
- `UpdateTagCommand`
- `DeleteTagCommand`
- `GetTagsQuery`

#### 5.5.2 Assigning Tags to Routes

Belongs to Routes feature:
- `UpdateRouteTagsCommand`

#### 5.5.3 Filtering by Tags

Belongs to Routes queries:

```csharp
public class GetRoutesQuery
{
    public List<Guid>? TagIds { get; set; }
}
```

**Key Insight:**

Tag complexity is not in the tag itself, but in:
- Route filtering
- Query composition

### 5.6 Collections Module

**Decision:** Use MediatR

**Reasoning:**
- Multiple operations:
  - Create collection
  - Add/remove routes
  - Reorder
- User-specific behavior
- Likely to expand

### 5.7 Categories Module

**Decision:** Use MediatR

**Reasoning:**
- Simple now
- Admin-managed
- Used in filtering logic

### 5.8 Business Module

**Decision:** Use MediatR

**Reasoning:**
- Separate domain (business users)
- Will include:
  - Spot management
  - Campaigns
  - Analytics
- High growth potential

### 5.9 Admin Module

**Decision:** Use MediatR

**Reasoning:**
- Cross-system authority
- Complex operations:
  - Moderation
  - Overrides
  - Bulk actions
## 6. Application Layer Structure

```
Core
├── Interfaces
│   └── Services
│       └── IAuthService.cs
├── Features
│   ├── Auth
│   ├── Routes
│   │   ├── Commands
│   │   └── Queries
│   ├── Spots
│   ├── Collections
│   ├── Tags
│   ├── Categories
│   ├── Business
│   └── Admin
```

## 7. Consistency Rules

### Rule 1
Use Service pattern only for Auth

### Rule 2
Use MediatR for all core domain features

### Rule 3
Do not mix patterns inside the same feature

**Bad:**
```
RoutesController → sometimes Service, sometimes MediatR
```

**Good:**
```
RoutesController → always MediatR
AuthController → always Service
```

### Rule 4
Controllers must not contain business logic

### Rule 5
Each endpoint maps to:
- one Command (write)
- or one Query (read)
## 8. Final Architectural Decisions

| Feature | Pattern | Reason |
|---|---|---|
| **Auth** | Service | Workflow-based, small |
| **Account** | Service | Simple user operations |
| **Routes** | MediatR | Core domain, complex |
| **Spots** | MediatR | Core domain |
| **Ratings** | MediatR | Domain rules, future growth |
| **Tags** | MediatR | Used in filtering & assignment |
| **Collections** | MediatR | Multi-operation feature |
| **Categories** | MediatR | Filtering & admin |
| **Business** | MediatR | Expanding domain |
| **Admin** | MediatR | System-wide control |