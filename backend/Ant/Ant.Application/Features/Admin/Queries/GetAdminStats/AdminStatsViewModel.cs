using System;
using System.Collections.Generic;

namespace Ant.Application.Features.Admin.Queries.GetAdminStats
{
    public class AdminStatsViewModel
    {
        public int TotalRoutes { get; set; }
        public int ActiveUsers { get; set; }
        public int TotalTags { get; set; }
        public List<RecentRouteDto> RecentRoutes { get; set; } = new();
        public List<TopSpotDto> TopSpots { get; set; } = new();
    }

    public class RecentRouteDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string AuthorName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class TopSpotDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public double AverageRating { get; set; }
    }
}
