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
    public class SpotRatingRepositoryAsync : GenericRepositoryAsync<SpotRating>, ISpotRatingRepositoryAsync
    {
        private readonly DbSet<SpotRating> _ratings;

        public SpotRatingRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _ratings = dbContext.Set<SpotRating>();
        }

        public async Task<SpotRating> GetByUserAndSpotAsync(Guid userId, Guid spotId)
        {
            return await _ratings
                .AsTracking()
                .FirstOrDefaultAsync(r => r.UserId == userId && r.SpotId == spotId);
        }

        public async Task<double?> GetAverageStarsAsync(Guid spotId)
        {
            var hasAny = await _ratings.AnyAsync(r => r.SpotId == spotId);
            if (!hasAny)
                return null;

            return await _ratings
                .Where(r => r.SpotId == spotId)
                .AverageAsync(r => (double)r.Stars);
        }
    }
}
