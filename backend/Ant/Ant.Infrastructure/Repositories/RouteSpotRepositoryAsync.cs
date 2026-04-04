using Ant.Core.Entities;
using Ant.Application.Interfaces.Repositories;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Repositories
{
    public class RouteSpotRepositoryAsync : GenericRepositoryAsync<RouteSpot>, IRouteSpotRepositoryAsync
    {
        private readonly ApplicationDbContext _dbContext;

        public RouteSpotRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IReadOnlyList<RouteSpot>> GetStopsForRouteAsync(Guid routeId)
        {
            return await _dbContext.RouteSpots
                .AsNoTracking()
                .Include(rs => rs.Spot)
                .Where(rs => rs.RouteId == routeId)
                .OrderBy(rs => rs.SpotOrder)
                .ToListAsync();
        }

        public async Task<RouteSpot> GetStopWithTrackingAsync(Guid routeStopId)
        {
            return await _dbContext.RouteSpots
                .AsTracking()
                .FirstOrDefaultAsync(rs => rs.Id == routeStopId);
        }

        public async Task<int> GetMaxOrderForRouteAsync(Guid routeId)
        {
            var hasStops = await _dbContext.RouteSpots.AnyAsync(rs => rs.RouteId == routeId);
            if (!hasStops) return 0;
            return await _dbContext.RouteSpots
                .Where(rs => rs.RouteId == routeId)
                .MaxAsync(rs => rs.SpotOrder);
        }

        public async Task ReorderStopsAsync(Guid routeId, List<Guid> orderedStopIds)
        {
            var stops = await _dbContext.RouteSpots
                .AsTracking()
                .Where(rs => rs.RouteId == routeId)
                .ToListAsync();

            for (int i = 0; i < orderedStopIds.Count; i++)
            {
                var stop = stops.FirstOrDefault(s => s.Id == orderedStopIds[i]);
                if (stop != null)
                    stop.SpotOrder = i + 1;
            }

            await _dbContext.SaveChangesAsync();
        }
    }
}
