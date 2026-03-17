using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Interfaces.Repositories
{
    public interface ICollectionRepositoryAsync : IGenericRepositoryAsync<Collection>
    {
        Task<IReadOnlyList<Collection>> GetCollectionsByUserIdAsync(Guid userId, int pageNumber, int pageSize);
        Task<IReadOnlyList<Collection>> GetAllCollectionsPagedAsync(int pageNumber, int pageSize);
        Task<Collection> GetCollectionWithRoutesAsync(Guid id);
        Task<Collection> GetDefaultCollectionAsync(Guid userId);
        Task<Collection> GetOrCreateDefaultCollectionAsync(Guid userId);
        Task<CollectionRoute> GetCollectionRouteAsync(Guid collectionId, Guid routeId);
        Task AddCollectionRouteAsync(CollectionRoute collectionRoute);
        Task RemoveCollectionRouteAsync(CollectionRoute collectionRoute);
    }
}
