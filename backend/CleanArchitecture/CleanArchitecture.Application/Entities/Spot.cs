using NetTopologySuite.Geometries;
using System.Collections.Generic;

namespace CleanArchitecture.Core.Entities
{
    public class Spot : AuditableBaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string PhotoUrl { get; set; }
        public Point Location { get; set; }
        public bool IsActive { get; set; }

        // Navigation properties
        public virtual ICollection<RouteSpot> RouteSpots { get; set; }
        public virtual ICollection<SpotRating> SpotRatings { get; set; }
    }
}
