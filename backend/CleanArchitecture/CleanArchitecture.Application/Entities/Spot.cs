using NetTopologySuite.Geometries;
using System.Collections.Generic;
using System;

namespace CleanArchitecture.Core.Entities
{
    public class Spot : BaseEntity
    {
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
        public virtual ICollection<RouteSpot> RouteSpots { get; set; }
        public virtual ICollection<SpotRating> SpotRatings { get; set; }
    }
}
