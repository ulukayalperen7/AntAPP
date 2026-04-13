using System;

namespace Ant.Core.Entities
{
    public class SpotFavorite
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; }

        public Guid SpotId { get; set; }
        public virtual Spot Spot { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
