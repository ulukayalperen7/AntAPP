using System;

namespace CleanArchitecture.Core.Entities
{
    public class RouteSpot : BaseEntity
    {
        public Guid RouteId { get; set; }
        public virtual Route Route { get; set; }

        public Guid SpotId { get; set; }
        public virtual Spot Spot { get; set; }

        public int SpotOrder { get; set; }

        public string CustomTitle { get; set; }
        public string CustomDescription { get; set; }
        public string CustomPhotoUrl { get; set; }
        
        // This maps to created_at in DB
        public DateTime CreatedAt { get; set; }
    }
}
