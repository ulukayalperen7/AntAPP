using Ant.Application.DTOs;
using NetTopologySuite.Geometries;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces
{
    public interface IMapRoutingService
    {
        Task<RouteGeometryResult> GetRouteGeometryAsync(List<Point> waypoints, CancellationToken cancellationToken = default);
    }
}
