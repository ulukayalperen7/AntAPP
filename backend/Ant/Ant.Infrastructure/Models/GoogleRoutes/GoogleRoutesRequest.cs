using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Ant.Infrastructure.Models.GoogleRoutes
{
    public class LatLng
    {
        [JsonPropertyName("latitude")]
        public double Latitude { get; set; }

        [JsonPropertyName("longitude")]
        public double Longitude { get; set; }
    }

    public class Location
    {
        [JsonPropertyName("latLng")]
        public LatLng LatLng { get; set; }
    }

    public class Waypoint
    {
        [JsonPropertyName("location")]
        public Location Location { get; set; }
    }

    public class GoogleRoutesRequest
    {
        [JsonPropertyName("origin")]
        public Waypoint Origin { get; set; }

        [JsonPropertyName("destination")]
        public Waypoint Destination { get; set; }

        [JsonPropertyName("intermediates")]
        public List<Waypoint> Intermediates { get; set; }

        [JsonPropertyName("travelMode")]
        public string TravelMode { get; set; }
    }
}
