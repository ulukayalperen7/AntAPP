using System;

namespace CleanArchitecture.Core.Entities
{
    public class SpotRating : BaseEntity
    {
        public Guid UserId { get; set; }

        public Guid SpotId { get; set; }
        public virtual Spot Spot { get; set; }

        public short Stars { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
