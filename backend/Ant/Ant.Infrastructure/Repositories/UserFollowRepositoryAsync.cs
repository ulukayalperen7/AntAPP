using Ant.Application.Interfaces.Repositories;
using Ant.Core.Entities;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Repositories
{
    public class UserFollowRepositoryAsync : GenericRepositoryAsync<UserFollow>, IUserFollowRepositoryAsync
    {
        private readonly ApplicationDbContext _dbContext;

        public UserFollowRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }

        public Task<UserFollow> GetFollowAsync(Guid followerUserId, Guid followingUserId)
        {
            return _dbContext.UserFollows
                .AsTracking()
                .FirstOrDefaultAsync(f => f.FollowerUserId == followerUserId && f.FollowingUserId == followingUserId);
        }

        public Task<bool> IsFollowingAsync(Guid followerUserId, Guid followingUserId)
        {
            return _dbContext.UserFollows
                .AnyAsync(f => f.FollowerUserId == followerUserId && f.FollowingUserId == followingUserId);
        }

        public Task<int> GetFollowerCountAsync(Guid userId)
        {
            return _dbContext.UserFollows.CountAsync(f => f.FollowingUserId == userId);
        }

        public Task<int> GetFollowingCountAsync(Guid userId)
        {
            return _dbContext.UserFollows.CountAsync(f => f.FollowerUserId == userId);
        }
    }
}
