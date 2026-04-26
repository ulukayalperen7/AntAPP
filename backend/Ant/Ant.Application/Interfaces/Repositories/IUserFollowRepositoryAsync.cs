using Ant.Core.Entities;
using System;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces.Repositories
{
    public interface IUserFollowRepositoryAsync : IGenericRepositoryAsync<UserFollow>
    {
        Task<UserFollow> GetFollowAsync(Guid followerUserId, Guid followingUserId);
        Task<bool> IsFollowingAsync(Guid followerUserId, Guid followingUserId);
        Task<int> GetFollowerCountAsync(Guid userId);
        Task<int> GetFollowingCountAsync(Guid userId);
    }
}
