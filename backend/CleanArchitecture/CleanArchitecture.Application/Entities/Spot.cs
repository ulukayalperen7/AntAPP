using NetTopologySuite.Geometries;
using System.Collections.Generic;
using System;

namespace CleanArchitecture.Core.Entities
{
    /// <summary>
    /// Represents a Point of Interest (POI) or a stop along a route.
    /// In AntAPP, a Spot is a standalone, reusable entity. 
    /// This means a single Spot can be linked to multiple different Routes.
    /// Location uses PostGIS for precise geographical coordinates.
    /// </summary>
    public class Spot : BaseEntity
    {
        public Guid? OwnerUserId { get; set; }
        public virtual User OwnerUser { get; set; }

        public string Name { get; set; }
        public string Description { get; set; }
        public string PhotoUrl { get; set; }
        public Point Location { get; set; }
        public bool IsActive { get; set; }

        public long RatingSum { get; set; }
        public long RatingCount { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        // A single Spot can be part of many Routes
        public virtual ICollection<RouteSpot> RouteSpots { get; set; }
        public virtual ICollection<SpotRating> SpotRatings { get; set; }
    }
}
