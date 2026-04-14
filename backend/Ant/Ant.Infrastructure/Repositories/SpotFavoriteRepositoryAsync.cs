using Ant.Application.Interfaces.Repositories;
using Ant.Core.Entities;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Repositories
{
    public class SpotFavoriteRepositoryAsync : GenericRepositoryAsync<SpotFavorite>, ISpotFavoriteRepositoryAsync
    {
        private readonly DbSet<SpotFavorite> _spotFavorites;
        private readonly ApplicationDbContext _context;

        public SpotFavoriteRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _spotFavorites = dbContext.Set<SpotFavorite>();
            _context = dbContext;
        }

        public async Task<List<Spot>> GetUserFavoritesAsync(Guid userId)
        {
            return await _spotFavorites
                .Where(sf => sf.UserId == userId)
                .Include(sf => sf.Spot)
                .Select(sf => sf.Spot)
                .ToListAsync();
        }

        public async Task<bool> IsFavoriteAsync(Guid userId, Guid spotId)
        {
            return await _spotFavorites.AnyAsync(sf => sf.UserId == userId && sf.SpotId == spotId);
        }

        public async Task<bool> ToggleFavoriteAsync(Guid userId, Guid spotId)
        {
            var existing = await _spotFavorites.FirstOrDefaultAsync(sf => sf.UserId == userId && sf.SpotId == spotId);
            
            if (existing != null)
            {
                _spotFavorites.Remove(existing);
                await _context.SaveChangesAsync();
                return false; // Removed
            }
            else
            {
                await _spotFavorites.AddAsync(new SpotFavorite { UserId = userId, SpotId = spotId, CreatedAt = DateTime.UtcNow });
                await _context.SaveChangesAsync();
                return true; // Added
            }
        }
    }
}
