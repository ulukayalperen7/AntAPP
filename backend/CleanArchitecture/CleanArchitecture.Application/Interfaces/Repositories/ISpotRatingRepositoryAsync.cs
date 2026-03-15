using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Interfaces.Repositories
{
    public interface ISpotRatingRepositoryAsync : IGenericRepositoryAsync<SpotRating>
    {
        Task<SpotRating> GetByUserAndSpotAsync(Guid userId, Guid spotId);
        Task<double?> GetAverageStarsAsync(Guid spotId);
    }
}
