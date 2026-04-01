using CleanArchitecture.Core.Entities;

namespace CleanArchitecture.Core.Interfaces.Repositories
{
    /// <summary>
    /// Repository interface for the Spot entity.
    /// Handles database operations specific to Points of Interest (Spots).
    /// </summary>
    public interface ISpotRepositoryAsync : IGenericRepositoryAsync<Spot>
    {
    }
}
