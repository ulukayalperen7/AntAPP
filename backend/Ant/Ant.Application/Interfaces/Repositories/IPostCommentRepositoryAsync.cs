using Ant.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces.Repositories
{
    public interface IPostCommentRepositoryAsync : IGenericRepositoryAsync<PostComment>
    {
        Task<IReadOnlyList<PostComment>> GetPagedByPostAsync(Guid postId, int pageNumber, int pageSize);
        Task<IReadOnlyList<PostComment>> GetRepliesAsync(Guid parentCommentId);
        Task<int> GetCountByPostAsync(Guid postId);
    }
}
