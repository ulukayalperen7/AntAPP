using System.Collections.Generic;

namespace CleanArchitecture.Core.Entities
{
    public class Category : AuditableBaseEntity
    {
        public string Name { get; set; }
        public bool IsActive { get; set; }

        // Navigation property
        public virtual ICollection<Route> Routes { get; set; }
    }
}
