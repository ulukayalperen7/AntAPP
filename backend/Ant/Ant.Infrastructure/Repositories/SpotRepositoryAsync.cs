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
    public class SpotRepositoryAsync : GenericRepositoryAsync<Spot>, ISpotRepositoryAsync
    {
        private readonly ApplicationDbContext _dbContext;

        public SpotRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Spot> GetSpotWithDetailsAsync(Guid spotId)
        {
            return await _dbContext.Spots
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == spotId && s.IsActive);
        }

        public async Task<IReadOnlyList<Spot>> GetPagedSpotsAsync(int pageNumber, int pageSize, string searchTerm = null)
        {
            var query = _dbContext.Spots.AsNoTracking().Include(s => s.RouteSpots).Where(s => s.IsActive);

            if (!string.IsNullOrEmpty(searchTerm))
            {
                var term = searchTerm.ToLower();
                query = query.Where(s => s.Name.ToLower().Contains(term) || s.Description.ToLower().Contains(term));
            }

            return await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalSpotsCountAsync(string searchTerm = null)
        {
            var query = _dbContext.Spots.AsNoTracking().Where(s => s.IsActive);

            if (!string.IsNullOrEmpty(searchTerm))
            {
                var term = searchTerm.ToLower();
                query = query.Where(s => s.Name.ToLower().Contains(term) || s.Description.ToLower().Contains(term));
            }

            return await query.CountAsync();
        }

        public async Task<IReadOnlyList<Route>> GetRoutesForSpotAsync(Guid spotId, int pageNumber, int pageSize)
        {
            return await _dbContext.Routes.AsNoTracking()
                .Where(r => r.IsPublic && !r.IsDeleted && r.RouteSpots.Any(rs => rs.SpotId == spotId))
                .OrderByDescending(r => r.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetRoutesForSpotCountAsync(Guid spotId)
        {
            return await _dbContext.Routes.AsNoTracking()
                .Where(r => r.IsPublic && !r.IsDeleted && r.RouteSpots.Any(rs => rs.SpotId == spotId))
                .CountAsync();
        }

        public async Task<IReadOnlyList<Spot>> GetBusinessSpotsAsync(Guid ownerUserId, int pageNumber, int pageSize)
        {
            return await _dbContext.Spots.AsNoTracking()
                .Where(s => s.OwnerUserId == ownerUserId)
                .OrderByDescending(s => s.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetBusinessSpotsCountAsync(Guid ownerUserId)
        {
            return await _dbContext.Spots.AsNoTracking()
                .Where(s => s.OwnerUserId == ownerUserId)
                .CountAsync();
        }

        public async Task<Spot> GetSpotWithTrackingAsync(Guid spotId)
        {
            return await _dbContext.Spots
                .AsTracking()
                .FirstOrDefaultAsync(s => s.Id == spotId);
        }
    }
}
