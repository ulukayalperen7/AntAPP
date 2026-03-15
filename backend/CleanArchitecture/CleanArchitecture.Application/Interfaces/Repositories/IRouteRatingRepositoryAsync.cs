using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Interfaces.Repositories
{
    public interface IRouteRatingRepositoryAsync : IGenericRepositoryAsync<RouteRating>
    {
        Task<RouteRating> GetByUserAndRouteAsync(Guid userId, Guid routeId);
        Task<double?> GetAverageStarsAsync(Guid routeId);
    }
}
