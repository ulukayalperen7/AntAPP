using Ant.Core.Entities;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Collections.Commands.CreateCollection
{
    public class CreateCollectionCommand : IRequest<Guid>
    {
        public string Name { get; set; }
        public bool IsPublic { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
    }

    public class CreateCollectionCommandHandler : IRequestHandler<CreateCollectionCommand, Guid>
    {
        private readonly ICollectionRepositoryAsync _collectionRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public CreateCollectionCommandHandler(ICollectionRepositoryAsync collectionRepository, IAuthenticatedUserService authenticatedUser)
        {
            _collectionRepository = collectionRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Guid> Handle(CreateCollectionCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var collection = new Collection
            {
                UserId = Guid.Parse(_authenticatedUser.UserId),
                Name = request.Name,
                IsPublic = request.IsPublic,
                Description = request.Description ?? string.Empty,
                ThumbnailUrl = request.ThumbnailUrl ?? string.Empty,
                IsDefault = false
            };

            await _collectionRepository.AddAsync(collection);
            return collection.Id;
        }
    }
}
