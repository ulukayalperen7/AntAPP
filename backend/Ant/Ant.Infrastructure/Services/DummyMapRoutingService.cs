using Ant.Application.DTOs;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using NetTopologySuite.Geometries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Services
{
    public class DummyMapRoutingService : IMapRoutingService
    {
        public Task<RouteGeometryResult> GetRouteGeometryAsync(List<Point> waypoints, CancellationToken cancellationToken = default)
        {
            if (waypoints == null || waypoints.Count < 2)
            {
                throw new ApiException("At least two waypoints are required to compute a route.");
            }

            // Calculate direct haversine distance as fallback
            double totalDistanceKm = 0;
            for (int i = 0; i < waypoints.Count - 1; i++)
            {
                totalDistanceKm += CalculateHaversineDistance(waypoints[i], waypoints[i + 1]);
            }

            int distanceMeters = (int)Math.Round(totalDistanceKm * 1000);
            
            // Assume strict walking speed of ~5.0 km/h for the dummy duration
            int durationSeconds = (int)Math.Round(totalDistanceKm / 5.0 * 3600);

            // Bounding box center calculation
            double minLat = waypoints.Min(w => w.Y);
            double maxLat = waypoints.Max(w => w.Y);
            double minLng = waypoints.Min(w => w.X);
            double maxLng = waypoints.Max(w => w.X);
            var centerPoint = new Point((minLng + maxLng) / 2.0, (minLat + maxLat) / 2.0) { SRID = 4326 };

            var result = new RouteGeometryResult
            {
                DistanceMeters = distanceMeters,
                DurationSeconds = durationSeconds,
                EncodedPolyline = EncodePolyline(waypoints),
                CenterPoint = centerPoint
            };

            return Task.FromResult(result);
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

        /// <summary>
        /// Generates a perfectly valid Google Maps encoded polyline straight from the points.
        /// This ensures the frontend will STILL be able to draw dashed straight lines directly between the points!
        /// </summary>
        private string EncodePolyline(List<Point> points)
        {
            var str = new StringBuilder();

            Action<int> encodeDiff = diff =>
            {
                int shifted = diff << 1;
                if (diff < 0)
                    shifted = ~shifted;

                int rem = shifted;
                while (rem >= 0x20)
                {
                    str.Append((char)((0x20 | (rem & 0x1f)) + 63));
                    rem >>= 5;
                }
                str.Append((char)(rem + 63));
            };

            int lastLat = 0;
            int lastLng = 0;
            foreach (var point in points)
            {
                int lat = (int)Math.Round(point.Y * 1e5);
                int lng = (int)Math.Round(point.X * 1e5);
                
                encodeDiff(lat - lastLat);
                encodeDiff(lng - lastLng);
                
                lastLat = lat;
                lastLng = lng;
            }
            return str.ToString();
        }
    }
}
