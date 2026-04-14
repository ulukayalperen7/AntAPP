using Ant.Application.Features.Spots.Queries.GetSpots;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Spots.Queries.GetSavedSpots
{
    public class GetSavedSpotsQuery : IRequest<Response<List<SpotListViewModel>>>
    {
        public Guid UserId { get; set; }
    }

    public class GetSavedSpotsQueryHandler : IRequestHandler<GetSavedSpotsQuery, Response<List<SpotListViewModel>>>
    {
        private readonly ISpotFavoriteRepositoryAsync _spotFavoriteRepository;

        public GetSavedSpotsQueryHandler(ISpotFavoriteRepositoryAsync spotFavoriteRepository)
        {
            _spotFavoriteRepository = spotFavoriteRepository;
        }

        public async Task<Response<List<SpotListViewModel>>> Handle(GetSavedSpotsQuery request, CancellationToken cancellationToken)
        {
            var spots = await _spotFavoriteRepository.GetUserFavoritesAsync(request.UserId);

            var viewModelList = spots.Select(s => new SpotListViewModel
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                PhotoUrl = s.PhotoUrl,
                Latitude = s.Location?.Y ?? 0,
                Longitude = s.Location?.X ?? 0,
                AverageRating = s.RatingCount == 0 ? 0 : Math.Round(s.RatingSum / (double)s.RatingCount, 1)
            }).ToList();

            return new Response<List<SpotListViewModel>>(viewModelList);
        }
    }
}
