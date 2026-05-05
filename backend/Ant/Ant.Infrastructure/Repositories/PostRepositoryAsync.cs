using Ant.Application.Interfaces.Repositories;
using Ant.Core.Entities;
using Ant.Core.Enums;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System;
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

        public async Task<IReadOnlyList<Post>> GetFeedPostsAsync(RouteContentTypeEnum? contentType, int pageNumber, int pageSize, Guid? authorId = null)
        {
            var query = BuildFeedQuery(contentType, authorId)
                .OrderByDescending(p => p.CreatedAt);

            return await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public Task<int> GetFeedPostsCountAsync(RouteContentTypeEnum? contentType, Guid? authorId = null)
        {
            return BuildFeedQuery(contentType, authorId).CountAsync();
        }

        public Task<Post> GetPublicPostByIdAsync(Guid postId)
        {
            return BuildFeedQuery(null).FirstOrDefaultAsync(p => p.Id == postId);
        }

        public Task<Post> GetPostForUpdateAsync(Guid postId)
        {
            return _dbContext.Posts
                .AsTracking()
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == postId && !p.IsDeleted);
        }

        public async Task ReplacePostImagesAsync(Post post, IReadOnlyList<string> imageUrls)
        {
            _dbContext.PostImages.RemoveRange(post.Images ?? new List<PostImage>());

            var images = imageUrls
                .Select((url, index) => new PostImage
                {
                    PostId = post.Id,
                    ImageUrl = url,
                    SortOrder = index + 1
                })
                .ToList();

            await _dbContext.PostImages.AddRangeAsync(images);
            await _dbContext.SaveChangesAsync();
        }

        private IQueryable<Post> BuildFeedQuery(RouteContentTypeEnum? contentType, Guid? authorId = null)
        {
            var query = _dbContext.Posts
                .AsNoTracking()
                .Include(p => p.AuthorUser)
                .Include(p => p.Route)
                .Include(p => p.Images)
                .Include(p => p.Reactions)
                .Include(p => p.Comments)
                .Include(p => p.Shares)
                .Where(p => !p.IsDeleted && p.IsPublic && !p.Route.IsDeleted && p.Route.IsPublic);

            if (contentType.HasValue)
            {
                query = query.Where(p => p.Route.ContentType == contentType.Value);
            }

            if (authorId.HasValue)
            {
                query = query.Where(p => p.AuthorUserId == authorId.Value);
            }

            return query;
        }
    }
}
