using CleanArchitecture.Core.Interfaces.Repositories;
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
    }

    public class GetSpotAverageRatingQueryHandler : IRequestHandler<GetSpotAverageRatingQuery, GetSpotAverageRatingViewModel>
    {
        private readonly ISpotRatingRepositoryAsync _ratingRepository;

        public GetSpotAverageRatingQueryHandler(ISpotRatingRepositoryAsync ratingRepository)
        {
            _ratingRepository = ratingRepository;
        }

        public async Task<GetSpotAverageRatingViewModel> Handle(GetSpotAverageRatingQuery request, CancellationToken cancellationToken)
        {
            var average = await _ratingRepository.GetAverageStarsAsync(request.SpotId);

            return new GetSpotAverageRatingViewModel
            {
                SpotId = request.SpotId,
                AverageStars = average
            };
        }
    }
}
