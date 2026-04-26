using Ant.Core.Entities;
using Ant.Core.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces.Repositories
{
    public interface IRouteRepositoryAsync : IGenericRepositoryAsync<Route>
    {
        Task<Route> GetRouteWithSpotsAsync(Guid routeId);
        Task<Route> GetRouteWithTrackingAsync(Guid routeId);
        Task<IReadOnlyList<Route>> GetPagedRoutesAsync(
            int pageNumber, int pageSize,
            string searchTerm = null,
            Guid? tagId = null,
            List<Guid> tagIds = null,
            string sort = null,
            double? nearLat = null, double? nearLng = null, double? radiusKm = null,
            Guid? authorId = null,
            string visibility = null,
            RouteContentTypeEnum? contentType = null);
        Task<int> GetTotalRoutesCountAsync(
            string searchTerm = null,
            Guid? tagId = null,
            List<Guid> tagIds = null,
            double? nearLat = null, double? nearLng = null, double? radiusKm = null,
            Guid? authorId = null,
            string visibility = null,
            RouteContentTypeEnum? contentType = null);
        Task<IReadOnlyList<Route>> GetNearbyRoutesAsync(double latitude, double longitude, double radiusInMeters, int pageNumber, int pageSize);
        Task<Route> GetForkByOriginalAsync(Guid originalRouteId, Guid authorId);

    }
}
