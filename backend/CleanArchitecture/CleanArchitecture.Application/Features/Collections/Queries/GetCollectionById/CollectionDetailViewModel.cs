using System;
using System.Collections.Generic;

namespace CleanArchitecture.Core.Features.Collections.Queries.GetCollectionById
{
    public class CollectionRouteItemViewModel
    {
        public Guid RouteId { get; set; }
        public string Title { get; set; }
        public string ThumbnailUrl { get; set; }
        public DateTime SavedAt { get; set; }
    }

    public class CollectionDetailViewModel
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; }
        public bool IsDefault { get; set; }
        public bool IsPublic { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
        public DateTime Created { get; set; }
        public List<CollectionRouteItemViewModel> Routes { get; set; }
    }
}
