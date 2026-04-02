using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CleanArchitecture.Core.Interfaces.Repositories;
using NetTopologySuite.Geometries;

namespace CleanArchitecture.Core.Features.Routes.Queries.GetNearbyRoutes
{
    public class GetNearbyRoutesQuery : IRequest<Response<IEnumerable<RouteListViewModel>>>
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
    public class RouteListViewModel
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

    public class GetNearbyRoutesQueryHandler : IRequestHandler<GetNearbyRoutesQuery, Response<IEnumerable<RouteListViewModel>>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;

        public GetNearbyRoutesQueryHandler(IRouteRepositoryAsync routeRepository)
        {
            _routeRepository = routeRepository;
        }

        public async Task<Response<IEnumerable<RouteListViewModel>>> Handle(GetNearbyRoutesQuery request, CancellationToken cancellationToken)
        {
            var validFilter = new CleanArchitecture.Core.Filters.RequestParameter(request.PageNumber, request.PageSize);
            
            var routes = await _routeRepository.GetNearbyRoutesAsync(
                request.Latitude, 
                request.Longitude, 
                request.RadiusInMeters, 
                validFilter.PageNumber, 
                validFilter.PageSize);

            // Manual mapping
            var viewModelList = routes.Select(r => new RouteListViewModel
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                ThumbnailUrl = r.ThumbnailUrl,
                AuthorUserId = r.AuthorUserId,
                CreatedAt = r.CreatedAt,
                
                // Dynamically compute the average based on cached aggregates to prevent database overhead.
                // Math.Round ensures a clean representation like 4.5 for UI stars.
                AverageRating = r.RatingCount == 0 ? 0 : Math.Round(r.RatingSum / (double)r.RatingCount, 1)
            }).ToList();

            return new Response<IEnumerable<RouteListViewModel>>(viewModelList, message: $"Found {viewModelList.Count} nearby route(s).");
        }
    }
}
