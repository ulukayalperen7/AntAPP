using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Collections.Commands.DeleteCollection
{
    public class DeleteCollectionCommand : IRequest<Guid>
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
    }

    public class DeleteCollectionCommandHandler : IRequestHandler<DeleteCollectionCommand, Guid>
    {
        private readonly ICollectionRepositoryAsync _collectionRepository;

        public DeleteCollectionCommandHandler(ICollectionRepositoryAsync collectionRepository)
        {
            _collectionRepository = collectionRepository;
        }

        public async Task<Guid> Handle(DeleteCollectionCommand request, CancellationToken cancellationToken)
        {
            var collection = await _collectionRepository.GetByIdAsync(request.Id);
            if (collection == null)
                throw new ApiException("Collection not found.");

            if (request.UserId.HasValue && collection.UserId != request.UserId.Value)
                throw new ApiException("Collection not found.");

            await _collectionRepository.DeleteAsync(collection);
            return collection.Id;
        }
    }
}
