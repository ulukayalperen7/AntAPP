using Ant.Core.Entities;
using Ant.Application.Common.Caching;
using Ant.Application.Interfaces;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ant.Application.Interfaces.Repositories;
using NetTopologySuite.Geometries;

namespace Ant.Application.Features.Routes.Queries.GetNearbyRoutes
{
    public class GetNearbyRoutesQuery : IRequest<Response<IEnumerable<RouteListNearbyViewModel>>>
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        
        /// <summary>
        /// Search radius in meters. Default is 5000 (5km).
        /// </summary>
        public double RadiusInMeters { get; set; } = 5000;
        
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    /// <summary>
    /// ViewModel for list representations of Routes.
    /// </summary>
    public class RouteListNearbyViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
        public Guid AuthorUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// The computed average rating (0.0 to 5.0) of the route.
        /// Optimized by avoiding expensive grouping operations and returning pre-aggregated data.
        /// </summary>
        public double AverageRating { get; set; }
    }

    public class GetNearbyRoutesQueryHandler : IRequestHandler<GetNearbyRoutesQuery, Response<IEnumerable<RouteListNearbyViewModel>>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAppCacheService _cache;

        public GetNearbyRoutesQueryHandler(IRouteRepositoryAsync routeRepository, IAppCacheService cache)
        {
            _routeRepository = routeRepository;
            _cache = cache;
        }

        public async Task<Response<IEnumerable<RouteListNearbyViewModel>>> Handle(GetNearbyRoutesQuery request, CancellationToken cancellationToken)
        {
            var validFilter = new Ant.Application.Filters.RequestParameter(request.PageNumber, request.PageSize);
            var cacheKey = AppCacheKeys.NearbyRoutes(request.Latitude, request.Longitude, request.RadiusInMeters, validFilter.PageNumber, validFilter.PageSize);

            return await _cache.GetOrCreateAsync(
                cacheKey,
                async _ =>
                {
                    var routes = await _routeRepository.GetNearbyRoutesAsync(
                        request.Latitude,
                        request.Longitude,
                        request.RadiusInMeters,
                        validFilter.PageNumber,
                        validFilter.PageSize);

                    var viewModelList = routes.Select(r => new RouteListNearbyViewModel
                    {
                        Id = r.Id,
                        Title = r.Title,
                        Description = r.Description,
                        ThumbnailUrl = r.ThumbnailUrl,
                        AuthorUserId = r.AuthorUserId,
                        CreatedAt = r.CreatedAt,
                        AverageRating = r.RatingCount == 0 ? 0 : Math.Round(r.RatingSum / (double)r.RatingCount, 1)
                    }).ToList();

                    return new Response<IEnumerable<RouteListNearbyViewModel>>(viewModelList, message: $"Found {viewModelList.Count} nearby route(s).");
                },
                TimeSpan.FromMinutes(1),
                cancellationToken);
        }
    }
}
