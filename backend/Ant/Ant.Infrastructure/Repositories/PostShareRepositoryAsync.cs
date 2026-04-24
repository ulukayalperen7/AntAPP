using Ant.Application.Interfaces.Repositories;
using Ant.Core.Entities;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Repositories
{
    public class PostShareRepositoryAsync : GenericRepositoryAsync<PostShare>, IPostShareRepositoryAsync
    {
        private readonly DbSet<PostShare> _shares;

        public PostShareRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _shares = dbContext.Set<PostShare>();
        }

        public Task<PostShare> GetByUserAndPostAsync(Guid userId, Guid postId)
        {
            return _shares
                .AsTracking()
                .FirstOrDefaultAsync(s => s.UserId == userId && s.PostId == postId);
        }
    }
}
