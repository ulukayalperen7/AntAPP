using CleanArchitecture.Core.Entities;

namespace CleanArchitecture.Core.Interfaces.Repositories
{
    /// <summary>
    /// Repository interface for the Route entity.
    /// Handles database operations specific to user journeys (Routes).
    /// </summary>
    public interface IRouteRepositoryAsync : IGenericRepositoryAsync<Route>
    {
    }
}
