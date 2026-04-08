using System;

namespace Ant.Application.Features.Collections.Queries.GetCollections
{
    public class CollectionViewModel
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; }
        public bool IsDefault { get; set; }
        public bool IsPublic { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
        public int RouteCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
