using Ant.Core.Entities;
using Ant.Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Tags.Commands.CreateTag
{
    /// <summary>
    /// Command to create a new Tag in the database.
    /// When a user sends a POST request with a tag name, this command handles the logic.
    /// </summary>
    public class CreateTagCommand : IRequest<Guid>
    {
        public string Name { get; set; }
        public string Description { get; set; }
    }

    public class CreateTagCommandHandler : IRequestHandler<CreateTagCommand, Guid>
    {
        private readonly ITagRepositoryAsync _tagRepository;

        public CreateTagCommandHandler(ITagRepositoryAsync tagRepository)
        {
            _tagRepository = tagRepository;
        }

        public async Task<Guid> Handle(CreateTagCommand request, CancellationToken cancellationToken)
        {
            var newTag = new Tag
            {
                Name = request.Name,
                Description = request.Description,
                IsActive = true
            };

            await _tagRepository.AddAsync(newTag);
            return newTag.Id;
        }
    }
}
