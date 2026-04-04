using Ant.Application.Exceptions;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Spots.Queries.GetSpotById
{
    public class GetSpotByIdQuery : IRequest<Response<SpotDetailViewModel>>
    {
        public Guid Id { get; set; }
    }

    public class SpotDetailViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string PhotoUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double AverageRating { get; set; }
        public long RatingCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class GetSpotByIdQueryHandler : IRequestHandler<GetSpotByIdQuery, Response<SpotDetailViewModel>>
    {
        private readonly ISpotRepositoryAsync _spotRepository;

        public GetSpotByIdQueryHandler(ISpotRepositoryAsync spotRepository)
        {
            _spotRepository = spotRepository;
        }

        public async Task<Response<SpotDetailViewModel>> Handle(GetSpotByIdQuery request, CancellationToken cancellationToken)
        {
            var spot = await _spotRepository.GetSpotWithDetailsAsync(request.Id);
            if (spot == null)
                throw new ApiException("Spot not found.");

            var viewModel = new SpotDetailViewModel
            {
                Id = spot.Id,
                Name = spot.Name,
                Description = spot.Description,
                PhotoUrl = spot.PhotoUrl,
                Latitude = spot.Location?.Y ?? 0,
                Longitude = spot.Location?.X ?? 0,
                AverageRating = spot.RatingCount == 0 ? 0 : Math.Round(spot.RatingSum / (double)spot.RatingCount, 1),
                RatingCount = spot.RatingCount,
                CreatedAt = spot.CreatedAt
            };

            return new Response<SpotDetailViewModel>(viewModel);
        }
    }
}
