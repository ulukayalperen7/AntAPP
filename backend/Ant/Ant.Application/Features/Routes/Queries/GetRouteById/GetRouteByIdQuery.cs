using Ant.Application.Common.Caching;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Routes.Queries.GetRouteById
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
        public Guid AuthorUserId { get; set; }
        public string OriginalAuthorName { get; set; }
        public Ant.Core.Enums.RouteContentTypeEnum ContentType { get; set; }
        public bool IsPublic { get; set; }

        public string EncodedPolyline { get; set; }
        public double TotalDistanceMeters { get; set; }
        public int EstimatedDurationSeconds { get; set; }
        public double CenterLatitude { get; set; }
        public double CenterLongitude { get; set; }
        
        
        /// <summary>        /// The sequential list of stops (Places) on this journey.
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
        public string SpotName { get; set; }
        public string CustomTitle { get; set; }
        public string Description { get; set; }
        public string PhotoUrl { get; set; }
        
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string GooglePlaceId { get; set; }
    }

    public class GetRouteByIdQueryHandler : IRequestHandler<GetRouteByIdQuery, Response<GetRouteByIdViewModel>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAppCacheService _cache;

        public GetRouteByIdQueryHandler(IRouteRepositoryAsync routeRepository, IAppCacheService cache)
        {
            _routeRepository = routeRepository;
            _cache = cache;
        }

        public async Task<Response<GetRouteByIdViewModel>> Handle(GetRouteByIdQuery request, CancellationToken cancellationToken)
        {
            return await _cache.GetOrCreateAsync(
                AppCacheKeys.RouteDetail(request.Id),
                async _ =>
                {
                    var route = await _routeRepository.GetRouteWithSpotsAsync(request.Id);

                    if (route == null) throw new ApiException($"Route NOT FOUND.");

                    var viewModel = new GetRouteByIdViewModel
                    {
                        Id = route.Id,
                        Title = route.Title,
                        Description = route.Description,
                        ThumbnailUrl = route.ThumbnailUrl,
                        AuthorUserId = route.AuthorUserId,
                        OriginalAuthorName = route.OriginalRoute?.AuthorUser?.UserName,
                        ContentType = route.ContentType,
                        IsPublic = route.IsPublic,
                        EncodedPolyline = route.EncodedPolyline,
                        TotalDistanceMeters = route.TotalDistanceMeters,
                        EstimatedDurationSeconds = route.EstimatedDurationSeconds,
                        CenterLatitude = route.CenterLocation?.Y ?? 0,
                        CenterLongitude = route.CenterLocation?.X ?? 0,
                        AverageRating = route.RatingCount == 0 ? 0 : Math.Round(route.RatingSum / (double)route.RatingCount, 1),
                        Stops = route.RouteSpots.OrderBy(rs => rs.SpotOrder).Select(rs => new RouteSpotDto
                        {
                            SpotId = rs.Spot.Id,
                            Order = rs.SpotOrder,
                            Name = string.IsNullOrEmpty(rs.CustomTitle) ? rs.Spot.Name : rs.CustomTitle,
                            SpotName = rs.Spot.Name,
                            CustomTitle = rs.CustomTitle,
                            Description = string.IsNullOrEmpty(rs.CustomDescription) ? rs.Spot.Description : rs.CustomDescription,
                            PhotoUrl = string.IsNullOrEmpty(rs.CustomPhotoUrl) ? rs.Spot.PhotoUrl : rs.CustomPhotoUrl,
                            Latitude = rs.Spot.Location.Y,
                            Longitude = rs.Spot.Location.X,
                            GooglePlaceId = rs.Spot.GooglePlaceId
                        }).ToList()
                    };

                    return new Response<GetRouteByIdViewModel>(viewModel);
                },
                TimeSpan.FromMinutes(5),
                cancellationToken);
        }
    }
}
