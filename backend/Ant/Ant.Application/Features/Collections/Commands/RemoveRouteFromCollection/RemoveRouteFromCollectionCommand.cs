using Ant.Application.Exceptions;
using Ant.Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Collections.Commands.RemoveRouteFromCollection
{
    public class RemoveRouteFromCollectionCommand : IRequest<Guid>
    {
        public Guid CollectionId { get; set; }
        public Guid RouteId { get; set; }
        public Guid? UserId { get; set; }
    }

    public class RemoveRouteFromCollectionCommandHandler : IRequestHandler<RemoveRouteFromCollectionCommand, Guid>
    {
        private readonly ICollectionRepositoryAsync _collectionRepository;

        public RemoveRouteFromCollectionCommandHandler(ICollectionRepositoryAsync collectionRepository)
        {
            _collectionRepository = collectionRepository;
        }

        public async Task<Guid> Handle(RemoveRouteFromCollectionCommand request, CancellationToken cancellationToken)
        {
            var collection = await _collectionRepository.GetByIdAsync(request.CollectionId);
            if (collection == null)
                throw new ApiException("Collection not found.");

            if (request.UserId.HasValue && collection.UserId != request.UserId.Value)
                throw new ApiException("Collection not found.");

            var collectionRoute = await _collectionRepository.GetCollectionRouteAsync(request.CollectionId, request.RouteId);
            if (collectionRoute == null)
                throw new ApiException("Route is not in this collection.");

            await _collectionRepository.RemoveCollectionRouteAsync(collectionRoute);
            return request.RouteId;
        }
    }
}
