using System;

namespace Ant.Core.Entities
{
    public class UserFollow : BaseEntity
    {
        public Guid FollowerUserId { get; set; }
        public virtual User FollowerUser { get; set; }

        public Guid FollowingUserId { get; set; }
        public virtual User FollowingUser { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
