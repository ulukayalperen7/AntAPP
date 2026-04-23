using Ant.Application.Common.Caching;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Spots.Queries.GetSpots
{
    public class GetSpotsQuery : IRequest<PagedResponse<SpotListViewModel>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string Search { get; set; }
    }

    public class SpotListViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string PhotoUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double AverageRating { get; set; }
    }

    public class GetSpotsQueryHandler : IRequestHandler<GetSpotsQuery, PagedResponse<SpotListViewModel>>
    {
        private readonly ISpotRepositoryAsync _spotRepository;
        private readonly IAppCacheService _cache;

        public GetSpotsQueryHandler(ISpotRepositoryAsync spotRepository, IAppCacheService cache)
        {
            _spotRepository = spotRepository;
            _cache = cache;
        }

        public async Task<PagedResponse<SpotListViewModel>> Handle(GetSpotsQuery request, CancellationToken cancellationToken)
        {
            var validFilter = new Ant.Application.Filters.RequestParameter(request.PageNumber, request.PageSize);
            var cacheKey = AppCacheKeys.SpotList(validFilter.PageNumber, validFilter.PageSize, request.Search);

            return await _cache.GetOrCreateAsync(
                cacheKey,
                async _ =>
                {
                    var spots = await _spotRepository.GetPagedSpotsAsync(validFilter.PageNumber, validFilter.PageSize, request.Search);
                    var total = await _spotRepository.GetTotalSpotsCountAsync(request.Search);

                    var viewModel = spots.Select(s => new SpotListViewModel
                    {
                        Id = s.Id,
                        Name = s.Name,
                        Description = s.Description,
                        PhotoUrl = s.PhotoUrl,
                        Latitude = s.Location?.Y ?? 0,
                        Longitude = s.Location?.X ?? 0,
                        AverageRating = s.RatingCount == 0 ? 0 : Math.Round(s.RatingSum / (double)s.RatingCount, 1)
                    }).ToList();

                    return new PagedResponse<SpotListViewModel>(viewModel, validFilter.PageNumber, validFilter.PageSize)
                    {
                        TotalRecords = total
                    };
                },
                TimeSpan.FromMinutes(2),
                cancellationToken);
        }
    }
}
