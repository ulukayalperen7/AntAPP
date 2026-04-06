using Ant.Application.DTOs;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Infrastructure.Models.GoogleRoutes;
using Microsoft.Extensions.Configuration;
using NetTopologySuite.Geometries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Services
{
    public class GoogleRoutesService : IMapRoutingService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public GoogleRoutesService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<RouteGeometryResult> GetRouteGeometryAsync(List<Point> waypoints, CancellationToken cancellationToken = default)
        {
            if (waypoints == null || waypoints.Count < 2)
            {
                throw new ApiException("At least two waypoints are required to compute a route.");
            }

            // Check max distance between consecutive waypoints
            double maxDistanceKm = _configuration.GetValue<double?>("RouteSettings:MaxRouteDistanceKm") ?? 50.0; // default 50km
            for (int i = 0; i < waypoints.Count - 1; i++)
            {
                double dist = CalculateHaversineDistance(waypoints[i], waypoints[i+1]);
                if (dist > maxDistanceKm)
                {
                    throw new ApiException($"Distance between spots ({Math.Round(dist, 1)}km) exceeds the maximum allowed contiguous distance of {maxDistanceKm}km.");
                }
            }

            var requestModel = new GoogleRoutesRequest
            {
                Origin = MapToWaypoint(waypoints.First()),
                Destination = MapToWaypoint(waypoints.Last()),
                Intermediates = waypoints.Count > 2 
                    ? waypoints.Skip(1).Take(waypoints.Count - 2).Select(MapToWaypoint).ToList() 
                    : null,
                
                // TODO: Future feature - ideally can be determined via distance natively 
                // e.g. short -> WALK, long -> DRIVE/PUBLIC_TRANSPORT. For MVP, hardcoded to WALK.
                TravelMode = "WALK"
            };

            string apiKey = _configuration["Google:ApiKey"];
            if (string.IsNullOrEmpty(apiKey))
                throw new ApiException("Server configuration error: Google API Key is missing.");

            var requestContent = new StringContent(JsonSerializer.Serialize(requestModel, new JsonSerializerOptions { DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull }), Encoding.UTF8, "application/json");

            var requestMessage = new HttpRequestMessage(HttpMethod.Post, "https://routes.googleapis.com/directions/v2:computeRoutes")
            {
                Content = requestContent
            };
            requestMessage.Headers.Add("X-Goog-Api-Key", apiKey);
            requestMessage.Headers.Add("X-Goog-FieldMask", "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline");

            var response = await _httpClient.SendAsync(requestMessage, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                throw new ApiException($"Failed to connect to map services. Status: {response.StatusCode}");
            }

            var responseString = await response.Content.ReadAsStringAsync(cancellationToken);
            var responseModel = JsonSerializer.Deserialize<GoogleRoutesResponse>(responseString);

            if (responseModel?.Routes == null || !responseModel.Routes.Any())
            {
                // Implement Option B: Fail aggressively 
                throw new ApiException("No route could be mapped between the specified locations.");
            }

            var routeData = responseModel.Routes.First();
            
            // Parse duration which comes as e.g. "439s" from Google
            int durationSeconds = 0;
            if (!string.IsNullOrEmpty(routeData.Duration) && routeData.Duration.EndsWith("s"))
            {
                int.TryParse(routeData.Duration.TrimEnd('s'), out durationSeconds);
            }

            // Calculate center point via simple bounding box average
            double minLat = waypoints.Min(w => w.Y);
            double maxLat = waypoints.Max(w => w.Y);
            double minLng = waypoints.Min(w => w.X);
            double maxLng = waypoints.Max(w => w.X);
            var centerPoint = new Point((minLng + maxLng) / 2.0, (minLat + maxLat) / 2.0) { SRID = 4326 };

            return new RouteGeometryResult
            {
                DistanceMeters = routeData.DistanceMeters,
                DurationSeconds = durationSeconds,
                EncodedPolyline = routeData.Polyline?.EncodedPolyline ?? "",
                CenterPoint = centerPoint
            };
        }

        private Models.GoogleRoutes.Waypoint MapToWaypoint(Point p)
        {
            return new Models.GoogleRoutes.Waypoint
            {
                Location = new Models.GoogleRoutes.Location
                {
                    LatLng = new Models.GoogleRoutes.LatLng
                    {
                        Latitude = p.Y,
                        Longitude = p.X
                    }
                }
            };
        }

        private double CalculateHaversineDistance(Point p1, Point p2)
        {
            double R = 6371.0; // Earth's radius in km
            double dLat = ToRadians(p2.Y - p1.Y);
            double dLon = ToRadians(p2.X - p1.X);
            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Cos(ToRadians(p1.Y)) * Math.Cos(ToRadians(p2.Y)) *
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            double c = 2 * Math.Asin(Math.Min(1, Math.Sqrt(a)));
            return R * c;
        }

        private double ToRadians(double angle)
        {
            return angle * (Math.PI / 180.0);
        }
    }
}
