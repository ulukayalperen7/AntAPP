using Ant.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces.Repositories
{
    public interface IPostReactionRepositoryAsync : IGenericRepositoryAsync<PostReaction>
    {
        Task<PostReaction> GetByUserAndPostAsync(Guid userId, Guid postId);
        Task<IReadOnlyList<PostReaction>> GetPagedByPostAsync(Guid postId, int pageNumber, int pageSize);
        Task<int> GetCountByPostAsync(Guid postId);
    }
}
