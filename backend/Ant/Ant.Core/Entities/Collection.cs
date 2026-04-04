using System;
using System.Collections.Generic;

namespace Ant.Core.Entities
{
    public class Collection : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; }

        public string Name { get; set; }
        public bool IsDefault { get; set; } // if true, the collection is the default collection for the user (Saved Routes)
        public bool IsPublic { get; set; } // if true, the collection is public and can be viewed by anyone
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<CollectionRoute> CollectionRoutes { get; set; }
    }
}
