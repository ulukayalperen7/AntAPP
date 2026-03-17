using CleanArchitecture.Core.Enums;
using System;
using System.Collections.Generic;

namespace CleanArchitecture.Core.Entities
{
    /// <summary>
    /// This is a "Route" in our app. A route is a path/journey that users create.
    /// It can contain multiple Spots (places) and can be tagged with multiple labels.
    /// For example: A route called "Istanbul Historical Walk" tagged with #Historical #Walking.
    /// </summary>
    public class Route : BaseEntity
    {
        public Guid AuthorUserId { get; set; }
        public virtual User AuthorUser { get; set; }

        public Guid? OriginalRouteId { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public RouteTypeEnum RouteType { get; set; }
        public bool IsPublic { get; set; }

        public long RatingSum { get; set; }
        public long RatingCount { get; set; }
        public bool IsDeleted { get; set; }

        // Navigation properties
        public virtual ICollection<RouteTag> RouteTags { get; set; }       // Many-to-many: A route can have multiple tags
        public virtual ICollection<RouteSpot> RouteSpots { get; set; }
        public virtual ICollection<CollectionRoute> CollectionRoutes { get; set; }
        public virtual ICollection<RouteRating> RouteRatings { get; set; }
    }
}
