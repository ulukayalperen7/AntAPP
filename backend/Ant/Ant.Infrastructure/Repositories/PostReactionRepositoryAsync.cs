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
    public class PostReactionRepositoryAsync : GenericRepositoryAsync<PostReaction>, IPostReactionRepositoryAsync
    {
        private readonly DbSet<PostReaction> _reactions;

        public PostReactionRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _reactions = dbContext.Set<PostReaction>();
        }

        public Task<PostReaction> GetByUserAndPostAsync(Guid userId, Guid postId)
        {
            return _reactions
                .AsTracking()
                .FirstOrDefaultAsync(r => r.UserId == userId && r.PostId == postId);
        }

        public async Task<IReadOnlyList<PostReaction>> GetPagedByPostAsync(Guid postId, int pageNumber, int pageSize)
        {
            return await _reactions
                .AsNoTracking()
                .Include(r => r.User)
                .Where(r => r.PostId == postId)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public Task<int> GetCountByPostAsync(Guid postId)
        {
            return _reactions
                .AsNoTracking()
                .CountAsync(r => r.PostId == postId);
        }
    }
}
