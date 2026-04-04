using System;

namespace Ant.Core.Entities
{
    /// <summary>
    /// Represents the ordered many-to-many relationship between Routes and Spots.
    /// This table preserves the order of spots within a specific route.
    /// It also allows for route-specific customization of a spot (e.g. a custom title for a general place).
    /// </summary>
    public class RouteSpot : BaseEntity
    {
        public Guid RouteId { get; set; }
        public virtual Route Route { get; set; }

        public Guid SpotId { get; set; }
        public virtual Spot Spot { get; set; }

        /// <summary>
        /// Defines the sequence order of this stop within the parent Route (1, 2, 3...).
        /// </summary>
        public int SpotOrder { get; set; }

        // Optional overrides for this specific instance of the Spot in this Route
        public string CustomTitle { get; set; }
        public string CustomDescription { get; set; }
        public string CustomPhotoUrl { get; set; }
        
        /// <summary>
        /// Timestamp of when this spot was added to the route.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}
