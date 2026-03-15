using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CleanArchitecture.Infrastructure.Repositories
{
    public class RouteRatingRepositoryAsync : GenericRepositoryAsync<RouteRating>, IRouteRatingRepositoryAsync
    {
        private readonly DbSet<RouteRating> _ratings;

        public RouteRatingRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _ratings = dbContext.Set<RouteRating>();
        }

        public async Task<RouteRating> GetByUserAndRouteAsync(Guid userId, Guid routeId)
        {
            return await _ratings
                .AsTracking()
                .FirstOrDefaultAsync(r => r.UserId == userId && r.RouteId == routeId);
        }

        public async Task<double?> GetAverageStarsAsync(Guid routeId)
        {
            var hasAny = await _ratings.AnyAsync(r => r.RouteId == routeId);
            if (!hasAny)
                return null;

            return await _ratings
                .Where(r => r.RouteId == routeId)
                .AverageAsync(r => (double)r.Stars);
        }
    }
}
