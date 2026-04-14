using Ant.Application.Exceptions;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Spots.Commands.ToggleSpotFavorite
{
    public class ToggleSpotFavoriteCommand : IRequest<Response<bool>>
    {
        public Guid SpotId { get; set; }
        public Guid UserId { get; set; }
    }

    public class ToggleSpotFavoriteCommandHandler : IRequestHandler<ToggleSpotFavoriteCommand, Response<bool>>
    {
        private readonly ISpotFavoriteRepositoryAsync _spotFavoriteRepository;

        public ToggleSpotFavoriteCommandHandler(ISpotFavoriteRepositoryAsync spotFavoriteRepository)
        {
            _spotFavoriteRepository = spotFavoriteRepository;
        }

        public async Task<Response<bool>> Handle(ToggleSpotFavoriteCommand request, CancellationToken cancellationToken)
        {
            var result = await _spotFavoriteRepository.ToggleFavoriteAsync(request.UserId, request.SpotId);
            
            // Result is true if added to favorites, false if removed
            return new Response<bool>(result, result ? "Spot added to favorites." : "Spot removed from favorites.");
        }
    }
}
