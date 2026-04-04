using Ant.Core.Entities;
using Ant.Application.Interfaces.Repositories;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Repositories
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
