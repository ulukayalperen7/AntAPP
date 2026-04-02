using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Routes.Queries.GetRouteById
{
    public class GetRouteByIdQuery : IRequest<Response<GetRouteByIdViewModel>>
    {
        public Guid Id { get; set; }
    }

    /// <summary>
    /// The final shape of the Route data returned to the Mobile App / Web Frontend.
    /// </summary>
    public class GetRouteByIdViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
        
        /// <summary>
        /// The sequential list of stops (Places) on this journey.
        /// </summary>
        public List<RouteSpotDto> Stops { get; set; }

        /// <summary>
        /// The computed average rating (0.0 to 5.0) of the route.
        /// Optimized by avoiding expensive grouping operations and returning pre-aggregated data.
        /// </summary>
        public double AverageRating { get; set; }
    }

    public class RouteSpotDto
    {
        public Guid SpotId { get; set; }
        public int Order { get; set; }
        
        // Combine real Spot data with optional Route-specific overrides
        public string Name { get; set; }
        public string Description { get; set; }
        public string PhotoUrl { get; set; }
        
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

    public class GetRouteByIdQueryHandler : IRequestHandler<GetRouteByIdQuery, Response<GetRouteByIdViewModel>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;

        public GetRouteByIdQueryHandler(IRouteRepositoryAsync routeRepository)
        {
            _routeRepository = routeRepository;
        }

        public async Task<Response<GetRouteByIdViewModel>> Handle(GetRouteByIdQuery request, CancellationToken cancellationToken)
        {
            var route = await _routeRepository.GetRouteWithSpotsAsync(request.Id);
            
            if (route == null) throw new ApiException($"Route NOT FOUND.");

            var viewModel = new GetRouteByIdViewModel
            {
                Id = route.Id,
                Title = route.Title,
                Description = route.Description,
                ThumbnailUrl = route.ThumbnailUrl,
                
                // Dynamically compute the average based on cached aggregates to prevent database overhead.
                // Math.Round ensures a clean representation like 4.5 for UI stars.
                AverageRating = route.RatingCount == 0 ? 0 : Math.Round(route.RatingSum / (double)route.RatingCount, 1),
                
                // Map the RouteSpots into the DTO and sort them by the strict SpotOrder!
                Stops = route.RouteSpots.OrderBy(rs => rs.SpotOrder).Select(rs => new RouteSpotDto
                {
                    SpotId = rs.Spot.Id,
                    Order = rs.SpotOrder,
                    
                    // Business Logic: If the user provided a Custom Title for this route, use it. Otherwise, use the original Spot name.
                    Name = string.IsNullOrEmpty(rs.CustomTitle) ? rs.Spot.Name : rs.CustomTitle,
                    Description = string.IsNullOrEmpty(rs.CustomDescription) ? rs.Spot.Description : rs.CustomDescription,
                    PhotoUrl = string.IsNullOrEmpty(rs.CustomPhotoUrl) ? rs.Spot.PhotoUrl : rs.CustomPhotoUrl,
                    
                    // PostGIS Coordinates mapped to standard doubles for frontend consumption
                    Latitude = rs.Spot.Location.Y, 
                    Longitude = rs.Spot.Location.X
                }).ToList()
            };

            return new Response<GetRouteByIdViewModel>(viewModel);
        }
    }
}
