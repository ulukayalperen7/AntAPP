using System.Collections.Generic;

namespace Ant.Core.Entities
{
    /// <summary>
    /// This is the "Tag" (Label/Etiket) table in our database.
    /// A Tag is a flexible label that can be attached to Routes.
    /// Tags can be assigned to a single route to help with categorization.
    /// Examples: "Nature", "Historical", "Free", "Family-Friendly", "Food"
    /// </summary>
    public class Tag : BaseEntity
    {
        // The name of the tag (e.g., "Sunset Spots")
        public string Name { get; set; }
        public string Description { get; set; }

        // Is this tag currently available to use?
        public bool IsActive { get; set; }

        // Navigation: One tag can be linked to many routes (many-to-many via RouteTag)
        public virtual ICollection<RouteTag> RouteTags { get; set; }
    }
}
