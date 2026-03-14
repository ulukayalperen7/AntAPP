using CleanArchitecture.Core.Enums;
using System;
using System.Collections.Generic;

namespace CleanArchitecture.Core.Entities
{
    public class Route : AuditableBaseEntity
    {
        public Guid AuthorUserId { get; set; }
        public Guid CategoryId { get; set; }
        public virtual Category Category { get; set; }

        public Guid? OriginalRouteId { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }

        public RouteTypeEnum RouteType { get; set; }
        public bool IsPublic { get; set; }

        public decimal AverageRating { get; set; }
        public int RatingCount { get; set; }
        public bool IsDeleted { get; set; }

        // Navigation properties
        public virtual ICollection<RouteSpot> RouteSpots { get; set; }
        public virtual ICollection<CollectionRoute> CollectionRoutes { get; set; }
        public virtual ICollection<Rating> Ratings { get; set; }
    }
}
