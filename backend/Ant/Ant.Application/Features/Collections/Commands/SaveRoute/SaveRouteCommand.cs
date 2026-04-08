using Ant.Core.Entities;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Collections.Commands.SaveRoute
{
    public class SaveRouteCommand : IRequest<Response<Guid>>
    {
        public Guid RouteId { get; set; }
    }

    public class SaveRouteCommandHandler : IRequestHandler<SaveRouteCommand, Response<Guid>>
    {
        private readonly ICollectionRepositoryAsync _collectionRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public SaveRouteCommandHandler(ICollectionRepositoryAsync collectionRepository, IAuthenticatedUserService authenticatedUser)
        {
            _collectionRepository = collectionRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Response<Guid>> Handle(SaveRouteCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            var defaultCollection = await _collectionRepository.GetOrCreateDefaultCollectionAsync(userId);

            var existing = await _collectionRepository.GetCollectionRouteAsync(defaultCollection.Id, request.RouteId);
            if (existing != null)
                return new Response<Guid>(defaultCollection.Id);

            var collectionRoute = new CollectionRoute
            {
                CollectionId = defaultCollection.Id,
                RouteId = request.RouteId,
                SavedAt = DateTime.UtcNow
            };

            await _collectionRepository.AddCollectionRouteAsync(collectionRoute);
            return new Response<Guid>(defaultCollection.Id);
        }
    }
}
