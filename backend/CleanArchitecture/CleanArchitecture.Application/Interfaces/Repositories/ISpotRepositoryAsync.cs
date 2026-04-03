using CleanArchitecture.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Interfaces.Repositories
{
    public interface ISpotRepositoryAsync : IGenericRepositoryAsync<Spot>
    {
        Task<Spot> GetSpotWithDetailsAsync(Guid spotId);
        Task<IReadOnlyList<Spot>> GetPagedSpotsAsync(int pageNumber, int pageSize, string searchTerm = null);
        Task<int> GetTotalSpotsCountAsync(string searchTerm = null);
        Task<IReadOnlyList<Route>> GetRoutesForSpotAsync(Guid spotId, int pageNumber, int pageSize);
        Task<int> GetRoutesForSpotCountAsync(Guid spotId);
        Task<IReadOnlyList<Spot>> GetBusinessSpotsAsync(Guid ownerUserId, int pageNumber, int pageSize);
        Task<int> GetBusinessSpotsCountAsync(Guid ownerUserId);
        Task<Spot> GetSpotWithTrackingAsync(Guid spotId);
    }
}
