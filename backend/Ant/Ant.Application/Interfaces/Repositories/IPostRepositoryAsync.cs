using Ant.Core.Entities;
using Ant.Core.Enums;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces.Repositories
{
    public interface IPostRepositoryAsync : IGenericRepositoryAsync<Post>
    {
        Task<IReadOnlyList<Post>> GetFeedPostsAsync(RouteContentTypeEnum? contentType, int pageNumber, int pageSize);
        Task<int> GetFeedPostsCountAsync(RouteContentTypeEnum? contentType);
    }
}
