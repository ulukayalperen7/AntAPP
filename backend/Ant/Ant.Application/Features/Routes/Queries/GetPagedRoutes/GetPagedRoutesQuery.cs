using Ant.Core.Enums;
using Ant.Application.Common.Caching;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Routes.Queries.GetPagedRoutes
{
    public class GetPagedRoutesQuery : IRequest<PagedResponse<RouteListViewModel>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string Search { get; set; }
        public Guid? TagId { get; set; }
        public List<Guid> TagIds { get; set; }
        public string Sort { get; set; }
        public double? NearLat { get; set; }
        public double? NearLng { get; set; }
        public double? RadiusKm { get; set; }
        public Guid? AuthorId { get; set; }
        public string Visibility { get; set; }
        public string Type { get; set; }
    }

    public class RouteListViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
        public Guid AuthorUserId { get; set; }
        public string AuthorUserName { get; set; }
        public Guid? OriginalRouteId { get; set; }
        public string OriginalAuthorName { get; set; }
        public string ContentType { get; set; }
        public bool IsPublic { get; set; }
        public DateTime CreatedAt { get; set; }
        public double TotalDistanceMeters { get; set; }
        public int EstimatedDurationSeconds { get; set; }
        public double CenterLatitude { get; set; }
        public double CenterLongitude { get; set; }
        public double AverageRating { get; set; }
    }

    public class GetPagedRoutesQueryHandler : IRequestHandler<GetPagedRoutesQuery, PagedResponse<RouteListViewModel>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAppCacheService _cache;

        public GetPagedRoutesQueryHandler(IRouteRepositoryAsync routeRepository, IAppCacheService cache)
        {
            _routeRepository = routeRepository;
            _cache = cache;
        }

        public async Task<PagedResponse<RouteListViewModel>> Handle(GetPagedRoutesQuery request, CancellationToken cancellationToken)
        {
            var validFilter = new Ant.Application.Filters.RequestParameter(request.PageNumber, request.PageSize);

            RouteContentTypeEnum? contentType = request.Type?.ToLower() switch
            {
                "official" => RouteContentTypeEnum.Official,
                "community" => RouteContentTypeEnum.Community,
                "sponsored" => RouteContentTypeEnum.Sponsored,
                _ => null
            };

            var cacheKey = AppCacheKeys.RouteList(
                validFilter.PageNumber,
                validFilter.PageSize,
                request.Search,
                request.TagId,
                request.TagIds,
                request.Sort,
                request.NearLat,
                request.NearLng,
                request.RadiusKm,
                request.AuthorId,
                request.Visibility,
                request.Type);

            return await _cache.GetOrCreateAsync(
                cacheKey,
                async _ =>
                {
                    var routes = await _routeRepository.GetPagedRoutesAsync(
                        request.PageNumber, request.PageSize,
                        request.Search, request.TagId, request.TagIds, request.Sort,
                        request.NearLat, request.NearLng, request.RadiusKm,
                        request.AuthorId, request.Visibility, contentType);

                    var totalRecords = await _routeRepository.GetTotalRoutesCountAsync(
                        request.Search, request.TagId, request.TagIds,
                        request.NearLat, request.NearLng, request.RadiusKm,
                        request.AuthorId, request.Visibility, contentType);

                    var viewModelList = routes.Select(r => new RouteListViewModel
                    {
                        Id = r.Id,
                        Title = r.Title,
                        Description = r.Description,
                        ThumbnailUrl = r.ThumbnailUrl,
                        AuthorUserId = r.AuthorUserId,
                        AuthorUserName = r.AuthorUser?.UserName,
                        OriginalRouteId = r.OriginalRouteId,
                        OriginalAuthorName = r.OriginalRoute?.AuthorUser?.UserName,
                        ContentType = r.ContentType.ToString(),
                        IsPublic = r.IsPublic,
                        CreatedAt = r.CreatedAt,
                        TotalDistanceMeters = r.TotalDistanceMeters,
                        EstimatedDurationSeconds = r.EstimatedDurationSeconds,
                        CenterLatitude = r.CenterLocation != null ? r.CenterLocation.Y : 0,
                        CenterLongitude = r.CenterLocation != null ? r.CenterLocation.X : 0,
                        AverageRating = r.RatingCount == 0 ? 0 : Math.Round(r.RatingSum / (double)r.RatingCount, 1)
                    }).ToList();

                    return new PagedResponse<RouteListViewModel>(viewModelList, validFilter.PageNumber, validFilter.PageSize)
                    {
                        TotalRecords = totalRecords
                    };
                },
                TimeSpan.FromMinutes(2),
                cancellationToken);
        }
    }
}
