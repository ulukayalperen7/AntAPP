using CleanArchitecture.Core.Entities;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Interfaces.Repositories
{
    /// <summary>
    /// Repository interface for the Route entity.
    /// Handles database operations specific to user journeys (Routes).
    /// </summary>
    public interface IRouteRepositoryAsync : IGenericRepositoryAsync<Route>
    {
        /// <summary>
        /// Retrieves a Route with all its attached ordered Spots and inner Spot details included.
        /// </summary>
        Task<Route> GetRouteWithSpotsAsync(Guid routeId);
    }
}
