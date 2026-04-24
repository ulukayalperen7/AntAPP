using Ant.Core.Entities;
using System;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces.Repositories
{
    public interface IPostReactionRepositoryAsync : IGenericRepositoryAsync<PostReaction>
    {
        Task<PostReaction> GetByUserAndPostAsync(Guid userId, Guid postId);
    }
}
