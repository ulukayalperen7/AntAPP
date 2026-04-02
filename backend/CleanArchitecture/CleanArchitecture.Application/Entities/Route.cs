using CleanArchitecture.Core.Enums;
using System;
using System.Collections.Generic;

namespace CleanArchitecture.Core.Entities
{
    /// <summary>
    /// Represents a complete journey created by a user.
    /// A route is an ordered sequence of Spots (via the RouteSpot junction table).
    /// </summary>
    public class Route : BaseEntity
    {
        /// <summary>
        /// The UUID of the user who created this route.
        /// </summary>
        public Guid AuthorUserId { get; set; }
        public virtual User AuthorUser { get; set; }

        /// <summary>
        /// If this route was cloned/forked from another route, this holds the ID of the original parent route.
        /// Used for maintaining attribution history.
        /// </summary>
        public Guid? OriginalRouteId { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// Defines if this is a standard 'Community' route or an 'Official' admin-verified route.
        /// </summary>
        public RouteTypeEnum RouteType { get; set; }
        
        /// <summary>
        /// True if the route is public, false if private to the author.
        /// </summary>
        public bool IsPublic { get; set; }

        public long RatingSum { get; set; }
        public long RatingCount { get; set; }
        
        /// <summary>
        /// Soft delete flag to prevent permanent removal of route history.
        /// </summary>
        public bool IsDeleted { get; set; }

        // Navigation properties
        public virtual ICollection<RouteTag> RouteTags { get; set; }       // Many-to-many: A route can have multiple tags
        
        /// <summary>
        /// The ordered list of stops (Spots) that make up this route.
        /// </summary>
        public virtual ICollection<RouteSpot> RouteSpots { get; set; }
        
        public virtual ICollection<CollectionRoute> CollectionRoutes { get; set; }
        public virtual ICollection<RouteRating> RouteRatings { get; set; }
    }
}
