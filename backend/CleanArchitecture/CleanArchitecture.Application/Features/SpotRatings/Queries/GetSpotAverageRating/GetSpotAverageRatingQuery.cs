using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.SpotRatings.Queries.GetSpotAverageRating
{
    public class GetSpotAverageRatingQuery : IRequest<GetSpotAverageRatingViewModel>
    {
        public Guid SpotId { get; set; }
    }

    public class GetSpotAverageRatingViewModel
    {
        public Guid SpotId { get; set; }
        public double? AverageStars { get; set; }
        public long RatingCount { get; set; }
    }

    public class GetSpotAverageRatingQueryHandler : IRequestHandler<GetSpotAverageRatingQuery, GetSpotAverageRatingViewModel>
    {
        private readonly IGenericRepositoryAsync<Spot> _spotRepository;

        public GetSpotAverageRatingQueryHandler(IGenericRepositoryAsync<Spot> spotRepository)
        {
            _spotRepository = spotRepository;
        }

        public async Task<GetSpotAverageRatingViewModel> Handle(GetSpotAverageRatingQuery request, CancellationToken cancellationToken)
        {
            var spot = await _spotRepository.GetByIdAsync(request.SpotId);
            if (spot == null)
                throw new ApiException("Spot not found.");

            return new GetSpotAverageRatingViewModel
            {
                SpotId = spot.Id,
                AverageStars = spot.RatingCount > 0 ? (double)spot.RatingSum / spot.RatingCount : null,
                RatingCount = spot.RatingCount
            };
        }
    }
}
