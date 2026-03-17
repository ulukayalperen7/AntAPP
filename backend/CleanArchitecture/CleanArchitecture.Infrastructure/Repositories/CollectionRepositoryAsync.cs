using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CleanArchitecture.Infrastructure.Repositories
{
    public class CollectionRepositoryAsync : GenericRepositoryAsync<Collection>, ICollectionRepositoryAsync
    {
        private readonly ApplicationDbContext _context;

        public CollectionRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _context = dbContext;
        }

        public async Task<IReadOnlyList<Collection>> GetCollectionsByUserIdAsync(Guid userId, int pageNumber, int pageSize)
        {
            return await _context.Collections
                .Where(c => c.UserId == userId)
                .Include(c => c.CollectionRoutes)
                .OrderByDescending(c => c.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IReadOnlyList<Collection>> GetAllCollectionsPagedAsync(int pageNumber, int pageSize)
        {
            return await _context.Collections
                .Include(c => c.CollectionRoutes)
                .OrderByDescending(c => c.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Collection> GetCollectionWithRoutesAsync(Guid id)
        {
            return await _context.Collections
                .Include(c => c.CollectionRoutes)
                    .ThenInclude(cr => cr.Route)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Collection> GetDefaultCollectionAsync(Guid userId)
        {
            return await _context.Collections
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.UserId == userId && c.IsDefault);
        }

        public async Task<Collection> GetOrCreateDefaultCollectionAsync(Guid userId)
        {
            var existing = await _context.Collections
                .FirstOrDefaultAsync(c => c.UserId == userId && c.IsDefault);

            if (existing != null)
                return existing;

            var defaultCollection = new Collection
            {
                UserId = userId,
                Name = "Saved Routes",
                IsDefault = true,
                IsPublic = false,
                Description = string.Empty,
                ThumbnailUrl = string.Empty
            };

            await _context.Collections.AddAsync(defaultCollection);
            await _context.SaveChangesAsync();
            return defaultCollection;
        }

        public async Task<CollectionRoute> GetCollectionRouteAsync(Guid collectionId, Guid routeId)
        {
            return await _context.CollectionRoutes
                .FirstOrDefaultAsync(cr => cr.CollectionId == collectionId && cr.RouteId == routeId);
        }

        public async Task AddCollectionRouteAsync(CollectionRoute collectionRoute)
        {
            await _context.CollectionRoutes.AddAsync(collectionRoute);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveCollectionRouteAsync(CollectionRoute collectionRoute)
        {
            var tracked = _context.CollectionRoutes.Local
                .FirstOrDefault(cr => cr.CollectionId == collectionRoute.CollectionId && cr.RouteId == collectionRoute.RouteId);

            _context.CollectionRoutes.Remove(tracked ?? collectionRoute);
            await _context.SaveChangesAsync();
        }
    }
}
