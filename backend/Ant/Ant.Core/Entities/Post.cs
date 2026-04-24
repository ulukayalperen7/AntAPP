using System;
using System.Collections.Generic;

namespace Ant.Core.Entities
{
    public class Post : BaseEntity
    {
        public Guid AuthorUserId { get; set; }
        public virtual User AuthorUser { get; set; }

        public Guid RouteId { get; set; }
        public virtual Route Route { get; set; }

        public string Content { get; set; }
        public bool IsPublic { get; set; }
        public bool IsDeleted { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public virtual ICollection<PostImage> Images { get; set; }
    }
}
