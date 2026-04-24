using System;

namespace Ant.Core.Entities
{
    public class PostComment : BaseEntity
    {
        public Guid PostId { get; set; }
        public virtual Post Post { get; set; }

        public Guid UserId { get; set; }
        public virtual User User { get; set; }

        public string Content { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
