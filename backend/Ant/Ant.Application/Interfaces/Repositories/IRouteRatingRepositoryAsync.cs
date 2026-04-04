using Ant.Core.Entities;
using Ant.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces.Repositories
{
    public interface IRouteRatingRepositoryAsync : IGenericRepositoryAsync<RouteRating>
    {
        Task<RouteRating> GetByUserAndRouteAsync(Guid userId, Guid routeId);
    }
}
