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

        /// <summary>
        /// Retrieves a paginated list of routes, optionally filtered by keyword or category.
        /// </summary>
        Task<System.Collections.Generic.IReadOnlyList<Route>> GetPagedRoutesAsync(int pageNumber, int pageSize, Guid? categoryId, string searchTerm);

        /// <summary>
        /// Gets the total count of routes matching the filters for pagination metadata.
        /// </summary>
        Task<int> GetTotalRoutesCountAsync(Guid? categoryId, string searchTerm);

        /// <summary>
        /// Retrieves a list of routes that have at least one spot within the given radius (in meters).
        /// Uses PostGIS ST_Distance under the hood.
        /// </summary>
        Task<System.Collections.Generic.IReadOnlyList<Route>> GetNearbyRoutesAsync(double latitude, double longitude, double radiusInMeters, int pageNumber, int pageSize);
    }
}
