using Ant.Application.Exceptions;
using Ant.Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Collections.Commands.UpdateCollection
{
    public class UpdateCollectionCommand : IRequest<Guid>
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string Name { get; set; }
        public bool IsPublic { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
    }

    public class UpdateCollectionCommandHandler : IRequestHandler<UpdateCollectionCommand, Guid>
    {
        private readonly ICollectionRepositoryAsync _collectionRepository;

        public UpdateCollectionCommandHandler(ICollectionRepositoryAsync collectionRepository)
        {
            _collectionRepository = collectionRepository;
        }

        public async Task<Guid> Handle(UpdateCollectionCommand request, CancellationToken cancellationToken)
        {
            var collection = await _collectionRepository.GetByIdAsync(request.Id);
            if (collection == null)
                throw new ApiException("Collection not found.");

            if (request.UserId.HasValue && collection.UserId != request.UserId.Value)
                throw new ApiException("Collection not found.");

            collection.Name = request.Name;
            collection.IsPublic = request.IsPublic;
            collection.Description = request.Description ?? string.Empty;
            collection.ThumbnailUrl = request.ThumbnailUrl ?? string.Empty;

            await _collectionRepository.UpdateAsync(collection);
            return collection.Id;
        }
    }
}
