using NetTopologySuite.Geometries;

namespace Ant.Application.DTOs
{
    public class RouteGeometryResult
    {
        public string EncodedPolyline { get; set; }
        public double DistanceMeters { get; set; }
        public int DurationSeconds { get; set; }
        public Point CenterPoint { get; set; }
    }
}
