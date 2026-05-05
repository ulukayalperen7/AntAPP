using Ant.Core.Entities;
using Ant.Core.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces.Repositories
{
    public interface IPostRepositoryAsync : IGenericRepositoryAsync<Post>
    {
        Task<IReadOnlyList<Post>> GetFeedPostsAsync(RouteContentTypeEnum? contentType, int pageNumber, int pageSize, Guid? authorId = null);
        Task<int> GetFeedPostsCountAsync(RouteContentTypeEnum? contentType, Guid? authorId = null);
        Task<Post> GetPublicPostByIdAsync(Guid postId);
        Task<Post> GetPostForUpdateAsync(Guid postId);
        Task ReplacePostImagesAsync(Post post, IReadOnlyList<string> imageUrls);
    }
}
