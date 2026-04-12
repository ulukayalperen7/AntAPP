using Ant.Core.Entities;
using Ant.Core.Enums;
using Ant.Application.Interfaces.Repositories;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Repositories
{
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

        public async Task<Route> GetRouteWithTrackingAsync(Guid routeId)
        {
            return await _dbContext.Routes
                .AsTracking()
                .Include(r => r.RouteSpots)
                .Include(r => r.RouteTags)
                .FirstOrDefaultAsync(r => r.Id == routeId);
        }

        private IQueryable<Route> BuildFilteredQuery(
            string searchTerm, Guid? tagId, List<Guid> tagIds,
            double? nearLat, double? nearLng, double? radiusKm,
            Guid? authorId, string visibility, RouteContentTypeEnum? contentType)
        {
            var query = _dbContext.Routes.AsNoTracking().Where(r => !r.IsDeleted);

            if (!string.IsNullOrEmpty(visibility))
            {
                query = visibility.ToLower() switch
                {
                    "public" => query.Where(r => r.IsPublic),
                    "draft" => query.Where(r => !r.IsPublic),
                    _ => query.Where(r => r.IsPublic)
                };
            }
            else
            {
                query = query.Where(r => r.IsPublic);
            }

            if (authorId.HasValue)
                query = query.Where(r => r.AuthorUserId == authorId.Value);

            if (contentType.HasValue)
                query = query.Where(r => r.ContentType == contentType.Value);

            if (tagId.HasValue)
                query = query.Where(r => r.RouteTags.Any(rt => rt.TagId == tagId.Value));

            if (tagIds != null && tagIds.Count > 0)
                query = query.Where(r => r.RouteTags.Any(rt => tagIds.Contains(rt.TagId)));

            if (!string.IsNullOrEmpty(searchTerm))
            {
                var term = searchTerm.ToLower();
                query = query.Where(r => r.Title.ToLower().Contains(term)
                                      || r.Description.ToLower().Contains(term));
            }

            if (nearLat.HasValue && nearLng.HasValue && radiusKm.HasValue)
            {
                var radiusMeters = radiusKm.Value * 1000;
                var point = new Point(nearLng.Value, nearLat.Value) { SRID = 4326 };
                query = query.Where(r => r.RouteSpots.Any(rs => rs.Spot.Location.Distance(point) <= radiusMeters));
            }

            return query;
        }

        public async Task<IReadOnlyList<Route>> GetPagedRoutesAsync(
            int pageNumber, int pageSize,
            string searchTerm, Guid? tagId, List<Guid> tagIds,
            string sort,
            double? nearLat, double? nearLng, double? radiusKm,
            Guid? authorId, string visibility, RouteContentTypeEnum? contentType)
        {
            var query = BuildFilteredQuery(searchTerm, tagId, tagIds, nearLat, nearLng, radiusKm, authorId, visibility, contentType);

            query = sort?.ToLower() switch
            {
                "rating" => query.OrderByDescending(r => r.RatingCount == 0 ? 0 : (r.RatingSum * 1.0) / r.RatingCount),
                "oldest" => query.OrderBy(r => r.CreatedAt),
                _ => query.OrderByDescending(r => r.CreatedAt)
            };

            return await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalRoutesCountAsync(
            string searchTerm, Guid? tagId, List<Guid> tagIds,
            double? nearLat, double? nearLng, double? radiusKm,
            Guid? authorId, string visibility, RouteContentTypeEnum? contentType)
        {
            return await BuildFilteredQuery(searchTerm, tagId, tagIds, nearLat, nearLng, radiusKm, authorId, visibility, contentType).CountAsync();
        }

        public async Task<IReadOnlyList<Route>> GetNearbyRoutesAsync(double latitude, double longitude, double radiusInMeters, int pageNumber, int pageSize)
        {
            var targetLocation = new Point(longitude, latitude) { SRID = 4326 };

            return await _dbContext.Routes.AsNoTracking()
                .Where(r => r.IsPublic && !r.IsDeleted && r.RouteSpots.Any(rs => rs.Spot.Location.Distance(targetLocation) <= radiusInMeters))
                .OrderBy(r => r.RouteSpots.Min(rs => rs.Spot.Location.Distance(targetLocation)))
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}
