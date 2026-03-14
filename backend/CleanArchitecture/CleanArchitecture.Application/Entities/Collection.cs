using System;
using System.Collections.Generic;

namespace CleanArchitecture.Core.Entities
{
    public class Collection : AuditableBaseEntity
    {
        public Guid UserId { get; set; }

        public string Name { get; set; }
        public bool IsDefault { get; set; }

        // Navigation properties
        public virtual ICollection<CollectionRoute> CollectionRoutes { get; set; }
    }
}
