using Ant.Application.Common.Caching;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Spots.Queries.GetSpotRoutes
{
    public class GetSpotRoutesQuery : IRequest<PagedResponse<SpotRouteViewModel>>
    {
        public Guid SpotId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class SpotRouteViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
        public Guid AuthorUserId { get; set; }
        public double AverageRating { get; set; }
    }

    public class GetSpotRoutesQueryHandler : IRequestHandler<GetSpotRoutesQuery, PagedResponse<SpotRouteViewModel>>
    {
        private readonly ISpotRepositoryAsync _spotRepository;
        private readonly IAppCacheService _cache;

        public GetSpotRoutesQueryHandler(ISpotRepositoryAsync spotRepository, IAppCacheService cache)
        {
            _spotRepository = spotRepository;
            _cache = cache;
        }

        public async Task<PagedResponse<SpotRouteViewModel>> Handle(GetSpotRoutesQuery request, CancellationToken cancellationToken)
        {
            var validFilter = new Ant.Application.Filters.RequestParameter(request.PageNumber, request.PageSize);
            var cacheKey = AppCacheKeys.SpotRoutes(request.SpotId, validFilter.PageNumber, validFilter.PageSize);

            return await _cache.GetOrCreateAsync(
                cacheKey,
                async _ =>
                {
                    var routes = await _spotRepository.GetRoutesForSpotAsync(request.SpotId, validFilter.PageNumber, validFilter.PageSize);
                    var total = await _spotRepository.GetRoutesForSpotCountAsync(request.SpotId);

                    var viewModel = routes.Select(r => new SpotRouteViewModel
                    {
                        Id = r.Id,
                        Title = r.Title,
                        Description = r.Description,
                        ThumbnailUrl = r.ThumbnailUrl,
                        AuthorUserId = r.AuthorUserId,
                        AverageRating = r.RatingCount == 0 ? 0 : Math.Round(r.RatingSum / (double)r.RatingCount, 1)
                    }).ToList();

                    return new PagedResponse<SpotRouteViewModel>(viewModel, validFilter.PageNumber, validFilter.PageSize)
                    {
                        TotalRecords = total
                    };
                },
                TimeSpan.FromMinutes(2),
                cancellationToken);
        }
    }
}
