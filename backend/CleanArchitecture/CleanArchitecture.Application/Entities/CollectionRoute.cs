using System;

namespace CleanArchitecture.Core.Entities
{
    public class CollectionRoute : BaseEntity
    {
        public Guid CollectionId { get; set; }
        public virtual Collection Collection { get; set; }

        public Guid RouteId { get; set; }
        public virtual Route Route { get; set; }

        public DateTime SavedAt { get; set; }
    }
}
