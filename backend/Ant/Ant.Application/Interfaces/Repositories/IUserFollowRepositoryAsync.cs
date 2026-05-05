using Ant.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces.Repositories
{
    public interface IUserFollowRepositoryAsync : IGenericRepositoryAsync<UserFollow>
    {
        Task<UserFollow> GetFollowAsync(Guid followerUserId, Guid followingUserId);
        Task<bool> IsFollowingAsync(Guid followerUserId, Guid followingUserId);
        Task<int> GetFollowerCountAsync(Guid userId);
        Task<int> GetFollowingCountAsync(Guid userId);
        Task<IReadOnlyList<UserFollow>> GetFollowersAsync(Guid userId, int pageNumber, int pageSize);
        Task<IReadOnlyList<UserFollow>> GetFollowingAsync(Guid userId, int pageNumber, int pageSize);
    }
}
