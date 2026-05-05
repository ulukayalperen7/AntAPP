using Ant.Application.Interfaces.Repositories;
using Ant.Core.Entities;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
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

        public async Task<IReadOnlyList<UserFollow>> GetFollowersAsync(Guid userId, int pageNumber, int pageSize)
        {
            return await _dbContext.UserFollows
                .AsNoTracking()
                .Include(f => f.FollowerUser)
                .Where(f => f.FollowingUserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<UserFollow>> GetFollowingAsync(Guid userId, int pageNumber, int pageSize)
        {
            return await _dbContext.UserFollows
                .AsNoTracking()
                .Include(f => f.FollowingUser)
                .Where(f => f.FollowerUserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}
