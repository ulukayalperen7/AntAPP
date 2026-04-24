using Ant.Core.Entities;
using System;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces.Repositories
{
    public interface IPostShareRepositoryAsync : IGenericRepositoryAsync<PostShare>
    {
        Task<PostShare> GetByUserAndPostAsync(Guid userId, Guid postId);
    }
}
