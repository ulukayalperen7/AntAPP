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
                .Include(r => r.RouteSpots)
                    .ThenInclude(rs => rs.Spot)
                .Include(r => r.RouteTags)
                    .ThenInclude(rt => rt.Tag)
                .FirstOrDefaultAsync(r => r.Id == routeId);
        }

        private IQueryable<Route> GetFilteredRoutesQuery(Guid? categoryId, string searchTerm)
        {
            var query = _dbContext.Routes.AsNoTracking().Where(r => r.IsPublic);

            if (categoryId.HasValue)
            {
                query = query.Where(r => r.RouteTags.Any(rt => rt.TagId == categoryId.Value));
            }

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(r => r.Title.ToLower().Contains(searchTerm.ToLower()) 
                                      || r.Description.ToLower().Contains(searchTerm.ToLower()));
            }

            return query;
        }

        public async Task<System.Collections.Generic.IReadOnlyList<Route>> GetPagedRoutesAsync(int pageNumber, int pageSize, Guid? categoryId, string searchTerm)
        {
            var query = GetFilteredRoutesQuery(categoryId, searchTerm);

            return await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalRoutesCountAsync(Guid? categoryId, string searchTerm)
        {
            var query = GetFilteredRoutesQuery(categoryId, searchTerm);
            return await query.CountAsync();
        }

        public async Task<System.Collections.Generic.IReadOnlyList<Route>> GetNearbyRoutesAsync(double latitude, double longitude, double radiusInMeters, int pageNumber, int pageSize)
        {
            var targetLocation = new NetTopologySuite.Geometries.Point(longitude, latitude) { SRID = 4326 };

            var routes = await _dbContext.Routes.AsNoTracking()
                .Where(r => r.IsPublic && r.RouteSpots.Any(rs => rs.Spot.Location.Distance(targetLocation) <= radiusInMeters))
                .OrderBy(r => r.RouteSpots.Min(rs => rs.Spot.Location.Distance(targetLocation)))
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return routes;
        }
    }
}
