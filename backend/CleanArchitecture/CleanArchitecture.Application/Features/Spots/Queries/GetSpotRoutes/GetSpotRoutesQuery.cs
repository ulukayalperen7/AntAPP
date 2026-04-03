using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Spots.Queries.GetSpotRoutes
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

        public GetSpotRoutesQueryHandler(ISpotRepositoryAsync spotRepository)
        {
            _spotRepository = spotRepository;
        }

        public async Task<PagedResponse<SpotRouteViewModel>> Handle(GetSpotRoutesQuery request, CancellationToken cancellationToken)
        {
            var validFilter = new CleanArchitecture.Core.Filters.RequestParameter(request.PageNumber, request.PageSize);

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
        }
    }
}
