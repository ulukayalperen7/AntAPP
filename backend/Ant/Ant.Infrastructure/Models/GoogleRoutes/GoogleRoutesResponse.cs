using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Ant.Infrastructure.Models.GoogleRoutes
{
    public class Polyline
    {
        [JsonPropertyName("encodedPolyline")]
        public string EncodedPolyline { get; set; }
    }

    public class RouteData
    {
        [JsonPropertyName("distanceMeters")]
        public int DistanceMeters { get; set; }

        [JsonPropertyName("duration")]
        public string Duration { get; set; } // Note: comes as "439s"

        [JsonPropertyName("polyline")]
        public Polyline Polyline { get; set; }
    }

    public class GoogleRoutesResponse
    {
        [JsonPropertyName("routes")]
        public List<RouteData> Routes { get; set; }
    }
}
