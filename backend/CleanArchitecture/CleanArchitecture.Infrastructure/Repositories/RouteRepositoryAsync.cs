using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Repository;
using CleanArchitecture.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.Infrastructure.Repositories
{
    /// <summary>
    /// Implementation of the Route repository. 
    /// Inherits standard CRUD operations from GenericRepositoryAsync.
    /// </summary>
    public class RouteRepositoryAsync : GenericRepositoryAsync<Route>, IRouteRepositoryAsync
    {
        private readonly ApplicationDbContext _dbContext;

        public RouteRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Route> GetRouteWithSpotsAsync(Guid routeId)
        {
            return await _dbContext.Routes
                // Include the junction table
                .Include(r => r.RouteSpots)
                    // Include the actual standalone Spot details inside the junction
                    .ThenInclude(rs => rs.Spot)
                // Also include tags
                .Include(r => r.RouteTags)
                    .ThenInclude(rt => rt.Tag)
                .FirstOrDefaultAsync(r => r.Id == routeId);
        }
    }
}
