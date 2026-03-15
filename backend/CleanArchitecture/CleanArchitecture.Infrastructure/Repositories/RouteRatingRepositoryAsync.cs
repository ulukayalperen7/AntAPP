using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System;
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
    }
}
