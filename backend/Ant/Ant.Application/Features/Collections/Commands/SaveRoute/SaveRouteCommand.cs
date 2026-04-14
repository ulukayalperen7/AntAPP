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
        /// <summary>Optional. If specified, saves to this collection. Otherwise saves to default.</summary>
        public Guid? CollectionId { get; set; }
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

            Collection targetCollection;
            if (request.CollectionId.HasValue)
            {
                targetCollection = await _collectionRepository.GetByIdAsync(request.CollectionId.Value)
                    ?? throw new ApiException("Collection not found.");
            }
            else
            {
                targetCollection = await _collectionRepository.GetOrCreateDefaultCollectionAsync(userId);
            }

            var existing = await _collectionRepository.GetCollectionRouteAsync(targetCollection.Id, request.RouteId);
            if (existing != null)
                return new Response<Guid>(targetCollection.Id);

            var collectionRoute = new CollectionRoute
            {
                CollectionId = targetCollection.Id,
                RouteId = request.RouteId,
                SavedAt = DateTime.UtcNow
            };

            await _collectionRepository.AddCollectionRouteAsync(collectionRoute);
            return new Response<Guid>(targetCollection.Id);
        }
    }
}
