using System;

namespace CleanArchitecture.Core.Entities
{
    public class RouteRating : BaseEntity
    {
        public Guid UserId { get; set; }

        public Guid RouteId { get; set; }
        public virtual Route Route { get; set; }

        public short Stars { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
