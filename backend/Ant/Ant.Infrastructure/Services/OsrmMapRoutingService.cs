using Ant.Application.DTOs;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using NetTopologySuite.Geometries;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Services
{
    public class OsrmMapRoutingService : IMapRoutingService
    {
        private readonly HttpClient _httpClient;

        public OsrmMapRoutingService(HttpClient httpClient)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        }

        public async Task<RouteGeometryResult> GetRouteGeometryAsync(List<Point> waypoints, CancellationToken cancellationToken = default)
        {
            if (waypoints == null || waypoints.Count < 2)
            {
                throw new ApiException("At least two waypoints are required to compute a route.");
            }

            // OSRM coordinates format: {longitude},{latitude};{longitude},{latitude}
            var coordinates = string.Join(";", waypoints.Select(w => 
                $"{w.X.ToString(CultureInfo.InvariantCulture)},{w.Y.ToString(CultureInfo.InvariantCulture)}"));

            var requestUrl = $"route/v1/driving/{coordinates}?overview=full&geometries=polyline";

            try
            {
                var response = await _httpClient.GetAsync(requestUrl, cancellationToken);
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new ApiException($"OSRM routing failed with status code: {response.StatusCode}");
                }

                var jsonString = await response.Content.ReadAsStringAsync(cancellationToken);
                
                using var jsonDocument = JsonDocument.Parse(jsonString);
                var root = jsonDocument.RootElement;

                if (root.GetProperty("code").GetString() != "Ok")
                {
                    throw new ApiException($"OSRM routing failed with code: {root.GetProperty("code").GetString()}");
                }

                var routes = root.GetProperty("routes");
                if (routes.GetArrayLength() == 0)
                {
                    throw new ApiException("OSRM routing returned no routes.");
                }

                var route = routes[0];
                var distanceMeters = (int)Math.Round(route.GetProperty("distance").GetDouble());
                var durationSeconds = (int)Math.Round(route.GetProperty("duration").GetDouble());
                var encodedPolyline = route.GetProperty("geometry").GetString();

                // Bounding box center calculation
                double minLat = waypoints.Min(w => w.Y);
                double maxLat = waypoints.Max(w => w.Y);
                double minLng = waypoints.Min(w => w.X);
                double maxLng = waypoints.Max(w => w.X);
                var centerPoint = new Point((minLng + maxLng) / 2.0, (minLat + maxLat) / 2.0) { SRID = 4326 };

                return new RouteGeometryResult
                {
                    DistanceMeters = distanceMeters,
                    DurationSeconds = durationSeconds,
                    EncodedPolyline = encodedPolyline,
                    CenterPoint = centerPoint
                };
            }
            catch (Exception ex) when (ex is not ApiException)
            {
                throw new ApiException($"An error occurred while fetching route from OSRM: {ex.Message}");
            }
        }
    }
}
