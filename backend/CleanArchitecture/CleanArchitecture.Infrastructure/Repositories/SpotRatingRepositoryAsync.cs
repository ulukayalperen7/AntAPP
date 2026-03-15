using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System;
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
    }
}
