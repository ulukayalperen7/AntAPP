using Ant.Core.Entities;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Collections.Commands.AddRouteToCollection
{
    public class AddRouteToCollectionCommand : IRequest<Guid>
    {
        public Guid CollectionId { get; set; }
        public Guid RouteId { get; set; }
        public Guid? UserId { get; set; }
    }

    public class AddRouteToCollectionCommandHandler : IRequestHandler<AddRouteToCollectionCommand, Guid>
    {
        private readonly ICollectionRepositoryAsync _collectionRepository;

        public AddRouteToCollectionCommandHandler(ICollectionRepositoryAsync collectionRepository)
        {
            _collectionRepository = collectionRepository;
        }

        public async Task<Guid> Handle(AddRouteToCollectionCommand request, CancellationToken cancellationToken)
        {
            var collection = await _collectionRepository.GetByIdAsync(request.CollectionId);
            if (collection == null)
                throw new ApiException("Collection not found.");

            if (request.UserId.HasValue && collection.UserId != request.UserId.Value)
                throw new ApiException("Collection not found.");

            var existing = await _collectionRepository.GetCollectionRouteAsync(request.CollectionId, request.RouteId);
            if (existing != null)
                throw new ApiException("Route is already in this collection.");

            var collectionRoute = new CollectionRoute
            {
                CollectionId = request.CollectionId,
                RouteId = request.RouteId,
                SavedAt = DateTime.UtcNow
            };

            await _collectionRepository.AddCollectionRouteAsync(collectionRoute);
            return request.RouteId;
        }
    }
}
