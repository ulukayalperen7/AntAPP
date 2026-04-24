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
    public class PostCommentRepositoryAsync : GenericRepositoryAsync<PostComment>, IPostCommentRepositoryAsync
    {
        private readonly DbSet<PostComment> _comments;

        public PostCommentRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _comments = dbContext.Set<PostComment>();
        }

        public async Task<IReadOnlyList<PostComment>> GetPagedByPostAsync(Guid postId, int pageNumber, int pageSize)
        {
            return await _comments
                .AsNoTracking()
                .Include(c => c.User)
                .Where(c => c.PostId == postId && !c.IsDeleted)
                .OrderByDescending(c => c.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public Task<int> GetCountByPostAsync(Guid postId)
        {
            return _comments
                .AsNoTracking()
                .CountAsync(c => c.PostId == postId && !c.IsDeleted);
        }
    }
}
