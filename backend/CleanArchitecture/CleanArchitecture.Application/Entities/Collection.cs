using System;
using System.Collections.Generic;

namespace CleanArchitecture.Core.Entities
{
    public class Collection : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; }

        public string Name { get; set; }
        public bool IsDefault { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<CollectionRoute> CollectionRoutes { get; set; }
    }
}
