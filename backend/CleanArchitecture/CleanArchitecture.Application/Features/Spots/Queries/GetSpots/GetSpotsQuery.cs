using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Spots.Queries.GetSpots
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

        public GetSpotsQueryHandler(ISpotRepositoryAsync spotRepository)
        {
            _spotRepository = spotRepository;
        }

        public async Task<PagedResponse<SpotListViewModel>> Handle(GetSpotsQuery request, CancellationToken cancellationToken)
        {
            var validFilter = new CleanArchitecture.Core.Filters.RequestParameter(request.PageNumber, request.PageSize);

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
        }
    }
}
