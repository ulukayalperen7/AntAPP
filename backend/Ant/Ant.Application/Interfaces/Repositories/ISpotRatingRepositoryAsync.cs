using Ant.Core.Entities;
using Ant.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces.Repositories
{
    public interface ISpotRatingRepositoryAsync : IGenericRepositoryAsync<SpotRating>
    {
        Task<SpotRating> GetByUserAndSpotAsync(Guid userId, Guid spotId);
    }
}
