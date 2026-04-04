using Ant.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces.Repositories
{
    public interface IRouteSpotRepositoryAsync : IGenericRepositoryAsync<RouteSpot>
    {
        Task<IReadOnlyList<RouteSpot>> GetStopsForRouteAsync(Guid routeId);
        Task<RouteSpot> GetStopWithTrackingAsync(Guid routeStopId);
        Task<int> GetMaxOrderForRouteAsync(Guid routeId);
        Task ReorderStopsAsync(Guid routeId, List<Guid> orderedStopIds);
    }
}
