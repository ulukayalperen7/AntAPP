using Ant.Application.Interfaces.Repositories;
using Ant.Core.Entities;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System;
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
    }
}
