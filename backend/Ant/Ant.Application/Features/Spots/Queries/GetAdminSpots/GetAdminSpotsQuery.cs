using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Spots.Queries.GetAdminSpots
{
    public class AdminSpotViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string PhotoUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int RouteCount { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class GetAdminSpotsQuery : IRequest<PagedResponse<AdminSpotViewModel>>
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public string SearchTerm { get; set; }
    }

    public class GetAdminSpotsQueryHandler : IRequestHandler<GetAdminSpotsQuery, PagedResponse<AdminSpotViewModel>>
    {
        private readonly ISpotRepositoryAsync _spotRepository;

        public GetAdminSpotsQueryHandler(ISpotRepositoryAsync spotRepository)
        {
            _spotRepository = spotRepository;
        }

        public async Task<PagedResponse<AdminSpotViewModel>> Handle(GetAdminSpotsQuery request, CancellationToken cancellationToken)
        {
            var validFilter = new GetAdminSpotsQuery 
            { 
                PageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber, 
                PageSize = request.PageSize <= 0 ? 10 : request.PageSize, 
                SearchTerm = request.SearchTerm 
            };

            var spots = await _spotRepository.GetAdminPagedSpotsAsync(validFilter.PageNumber, validFilter.PageSize, validFilter.SearchTerm);
            var totalRecords = await _spotRepository.GetAdminSpotsCountAsync(validFilter.SearchTerm);

            var mappedData = spots.Select(s => new AdminSpotViewModel
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                PhotoUrl = s.PhotoUrl,
                Latitude = s.Location?.Y ?? 0,
                Longitude = s.Location?.X ?? 0,
                RouteCount = s.RouteSpots?.Count ?? 0,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt
            }).ToList();

            return new PagedResponse<AdminSpotViewModel>(mappedData, validFilter.PageNumber, validFilter.PageSize) 
            { 
                TotalRecords = totalRecords 
            };
        }
    }
}
