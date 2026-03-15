using System.Collections.Generic;

namespace CleanArchitecture.Core.Entities
{
    /// <summary>
    /// This is the "Category" table in our database.
    /// It represents a group of places, like "Museums", "Parks", or "Beaches".
    /// </summary>
    public class Category : AuditableBaseEntity
    {
        // The name of the category (e.g., "Food & Drinks")
        public string Name { get; set; }
        
        // Is this category currently available to use?
        public bool IsActive { get; set; }

        // Navigation property: One category can have many Routes inside it.
        public virtual ICollection<Route> Routes { get; set; }
    }
}
