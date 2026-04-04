using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Spots.Queries.GetBusinessSpots
{
    public class GetBusinessSpotsQuery : IRequest<PagedResponse<BusinessSpotViewModel>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public Guid OwnerUserId { get; set; }
    }

    public class BusinessSpotViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string PhotoUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public bool IsActive { get; set; }
        public double AverageRating { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class GetBusinessSpotsQueryHandler : IRequestHandler<GetBusinessSpotsQuery, PagedResponse<BusinessSpotViewModel>>
    {
        private readonly ISpotRepositoryAsync _spotRepository;

        public GetBusinessSpotsQueryHandler(ISpotRepositoryAsync spotRepository)
        {
            _spotRepository = spotRepository;
        }

        public async Task<PagedResponse<BusinessSpotViewModel>> Handle(GetBusinessSpotsQuery request, CancellationToken cancellationToken)
        {
            var validFilter = new Ant.Application.Filters.RequestParameter(request.PageNumber, request.PageSize);

            var spots = await _spotRepository.GetBusinessSpotsAsync(request.OwnerUserId, validFilter.PageNumber, validFilter.PageSize);
            var total = await _spotRepository.GetBusinessSpotsCountAsync(request.OwnerUserId);

            var viewModel = spots.Select(s => new BusinessSpotViewModel
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                PhotoUrl = s.PhotoUrl,
                Latitude = s.Location?.Y ?? 0,
                Longitude = s.Location?.X ?? 0,
                IsActive = s.IsActive,
                AverageRating = s.RatingCount == 0 ? 0 : Math.Round(s.RatingSum / (double)s.RatingCount, 1),
                CreatedAt = s.CreatedAt
            }).ToList();

            return new PagedResponse<BusinessSpotViewModel>(viewModel, validFilter.PageNumber, validFilter.PageSize)
            {
                TotalRecords = total
            };
        }
    }
}
