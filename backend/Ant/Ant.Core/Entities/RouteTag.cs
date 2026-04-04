using System;

namespace Ant.Core.Entities
{
    /// <summary>
    /// This is the "Bridge Table" (Junction Table) between Routes and Tags.
    /// It enables a many-to-many relationship:
    ///   - One Route can have MANY Tags (e.g., "Nature", "Free", "Family").
    ///   - One Tag can belong to MANY Routes.
    /// </summary>
    public class RouteTag
    {
        public Guid RouteId { get; set; }
        public virtual Route Route { get; set; }

        public Guid TagId { get; set; }
        public virtual Tag Tag { get; set; }
    }
}
