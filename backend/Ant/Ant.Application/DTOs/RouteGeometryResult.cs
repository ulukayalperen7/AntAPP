using NetTopologySuite.Geometries;
using System.Text.Json.Serialization;

namespace Ant.Application.DTOs
{
    public class RouteGeometryResult
    {
        public string EncodedPolyline { get; set; }
        public double DistanceMeters { get; set; }
        public int DurationSeconds { get; set; }

        [JsonIgnore]
        public Point CenterPoint { get; set; }

        // Added for frontend serialization to prevent NaN/Infinity serialization crash from NTS Point
        public double CenterLatitude => CenterPoint?.Y ?? 0;
        public double CenterLongitude => CenterPoint?.X ?? 0;
    }
}
