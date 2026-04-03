using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.SpotRatings.Queries.GetSpotRatings
{
    public class GetSpotRatingsQuery : IRequest<Response<SpotRatingSummaryViewModel>>
    {
        public Guid SpotId { get; set; }
    }

    public class SpotRatingSummaryViewModel
    {
        public double AverageRating { get; set; }
        public long TotalRatings { get; set; }
    }

    public class GetSpotRatingsQueryHandler : IRequestHandler<GetSpotRatingsQuery, Response<SpotRatingSummaryViewModel>>
    {
        private readonly ISpotRepositoryAsync _spotRepository;

        public GetSpotRatingsQueryHandler(ISpotRepositoryAsync spotRepository)
        {
            _spotRepository = spotRepository;
        }

        public async Task<Response<SpotRatingSummaryViewModel>> Handle(GetSpotRatingsQuery request, CancellationToken cancellationToken)
        {
            var spot = await _spotRepository.GetByIdAsync(request.SpotId);
            if (spot == null)
                throw new CleanArchitecture.Core.Exceptions.ApiException("Spot not found.");

            var viewModel = new SpotRatingSummaryViewModel
            {
                AverageRating = spot.RatingCount == 0 ? 0 : Math.Round(spot.RatingSum / (double)spot.RatingCount, 1),
                TotalRatings = spot.RatingCount
            };

            return new Response<SpotRatingSummaryViewModel>(viewModel);
        }
    }
}
