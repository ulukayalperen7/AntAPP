using Ant.Application.Interfaces.Repositories;
using Ant.Core.Entities;
using Ant.Core.Enums;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Repositories
{
    public class PostRepositoryAsync : GenericRepositoryAsync<Post>, IPostRepositoryAsync
    {
        private readonly ApplicationDbContext _dbContext;

        public PostRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IReadOnlyList<Post>> GetFeedPostsAsync(RouteContentTypeEnum? contentType, int pageNumber, int pageSize)
        {
            var query = BuildFeedQuery(contentType)
                .OrderByDescending(p => p.CreatedAt);

            return await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public Task<int> GetFeedPostsCountAsync(RouteContentTypeEnum? contentType)
        {
            return BuildFeedQuery(contentType).CountAsync();
        }

        private IQueryable<Post> BuildFeedQuery(RouteContentTypeEnum? contentType)
        {
            var query = _dbContext.Posts
                .AsNoTracking()
                .Include(p => p.AuthorUser)
                .Include(p => p.Route)
                .Include(p => p.Images)
                .Where(p => !p.IsDeleted && p.IsPublic && !p.Route.IsDeleted && p.Route.IsPublic);

            if (contentType.HasValue)
            {
                query = query.Where(p => p.Route.ContentType == contentType.Value);
            }

            return query;
        }
    }
}
