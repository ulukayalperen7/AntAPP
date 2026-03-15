using CleanArchitecture.Core.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.RouteRatings.Queries.GetRouteAverageRating
{
    public class GetRouteAverageRatingQuery : IRequest<GetRouteAverageRatingViewModel>
    {
        public Guid RouteId { get; set; }
    }

    public class GetRouteAverageRatingViewModel
    {
        public Guid RouteId { get; set; }
        public double? AverageStars { get; set; }
    }

    public class GetRouteAverageRatingQueryHandler : IRequestHandler<GetRouteAverageRatingQuery, GetRouteAverageRatingViewModel>
    {
        private readonly IRouteRatingRepositoryAsync _ratingRepository;

        public GetRouteAverageRatingQueryHandler(IRouteRatingRepositoryAsync ratingRepository)
        {
            _ratingRepository = ratingRepository;
        }

        public async Task<GetRouteAverageRatingViewModel> Handle(GetRouteAverageRatingQuery request, CancellationToken cancellationToken)
        {
            var average = await _ratingRepository.GetAverageStarsAsync(request.RouteId);

            return new GetRouteAverageRatingViewModel
            {
                RouteId = request.RouteId,
                AverageStars = average
            };
        }
    }
}
