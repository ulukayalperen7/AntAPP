using Ant.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces.Repositories
{
    public interface ISpotFavoriteRepositoryAsync : IGenericRepositoryAsync<SpotFavorite>
    {
        Task<bool> ToggleFavoriteAsync(Guid userId, Guid spotId);
        Task<List<Spot>> GetUserFavoritesAsync(Guid userId);
        Task<bool> IsFavoriteAsync(Guid userId, Guid spotId);
    }
}
