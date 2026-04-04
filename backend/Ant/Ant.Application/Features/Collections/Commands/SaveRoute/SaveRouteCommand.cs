using Ant.Core.Entities;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Collections.Commands.SaveRoute
{
    public class SaveRouteCommand : IRequest<Guid>
    {
        public Guid RouteId { get; set; }
    }

    public class SaveRouteCommandHandler : IRequestHandler<SaveRouteCommand, Guid>
    {
        private readonly ICollectionRepositoryAsync _collectionRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public SaveRouteCommandHandler(ICollectionRepositoryAsync collectionRepository, IAuthenticatedUserService authenticatedUser)
        {
            _collectionRepository = collectionRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Guid> Handle(SaveRouteCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            var defaultCollection = await _collectionRepository.GetOrCreateDefaultCollectionAsync(userId);

            var existing = await _collectionRepository.GetCollectionRouteAsync(defaultCollection.Id, request.RouteId);
            if (existing != null)
                throw new ApiException("Route is already saved.");

            var collectionRoute = new CollectionRoute
            {
                CollectionId = defaultCollection.Id,
                RouteId = request.RouteId,
                SavedAt = DateTime.UtcNow
            };

            await _collectionRepository.AddCollectionRouteAsync(collectionRoute);
            return defaultCollection.Id;
        }
    }
}
