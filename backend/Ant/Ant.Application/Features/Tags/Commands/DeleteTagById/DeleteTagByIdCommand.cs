using Ant.Application.Common.Caching;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Tags.Commands.DeleteTagById
{
    /// <summary>
    /// Command to delete a Tag by its unique ID.
    /// If the tag does not exist, it throws a friendly error message.
    /// </summary>
    public class DeleteTagByIdCommand : IRequest<Guid>
    {
        public Guid Id { get; set; }
    }

    public class DeleteTagByIdCommandHandler : IRequestHandler<DeleteTagByIdCommand, Guid>
    {
        private readonly ITagRepositoryAsync _tagRepository;
        private readonly IAppCacheService _cache;

        public DeleteTagByIdCommandHandler(ITagRepositoryAsync tagRepository, IAppCacheService cache)
        {
            _tagRepository = tagRepository;
            _cache = cache;
        }

        public async Task<Guid> Handle(DeleteTagByIdCommand command, CancellationToken cancellationToken)
        {
            var tag = await _tagRepository.GetByIdAsync(command.Id);
            if (tag == null) throw new ApiException($"Tag Not Found.");
            await _tagRepository.DeleteAsync(tag);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.TagsPrefix, cancellationToken);
            return tag.Id;
        }
    }
}
