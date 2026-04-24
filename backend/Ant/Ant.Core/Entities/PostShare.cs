using System;

namespace Ant.Core.Entities
{
    public class PostShare : BaseEntity
    {
        public Guid PostId { get; set; }
        public virtual Post Post { get; set; }

        public Guid UserId { get; set; }
        public virtual User User { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
