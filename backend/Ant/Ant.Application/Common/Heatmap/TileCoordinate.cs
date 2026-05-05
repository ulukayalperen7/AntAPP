using System;

namespace Ant.Application.Common.Heatmap
{
    public static class TileCoordinate
    {
        public const int DefaultZoom = 14;

        public static (int X, int Y) FromLatLng(double latitude, double longitude, int zoom = DefaultZoom)
        {
            var latRad = latitude * Math.PI / 180.0;
            var n = 1 << zoom;

            var x = (int)Math.Floor((longitude + 180.0) / 360.0 * n);
            var y = (int)Math.Floor((1.0 - Math.Log(Math.Tan(latRad) + 1.0 / Math.Cos(latRad)) / Math.PI) / 2.0 * n);

            x = Math.Clamp(x, 0, n - 1);
            y = Math.Clamp(y, 0, n - 1);

            return (x, y);
        }

        public static string ToTileKey(int x, int y, int zoom = DefaultZoom)
        {
            return $"tile:{zoom}:{x}:{y}";
        }

        public static string ToTileKey(double latitude, double longitude, int zoom = DefaultZoom)
        {
            var (x, y) = FromLatLng(latitude, longitude, zoom);
            return ToTileKey(x, y, zoom);
        }

        public static (int X, int Y) ParseTileKey(string tileKey)
        {
            var parts = tileKey.Split(':');
            return (int.Parse(parts[2]), int.Parse(parts[3]));
        }

        public static (double Lat, double Lng) TileCenter(int x, int y, int zoom)
        {
            var n = 1 << zoom;
            var lng = ((x + 0.5) / n) * 360.0 - 180.0;
            var latRad = System.Math.Atan(System.Math.Sinh(System.Math.PI * (1.0 - 2.0 * (y + 0.5) / n)));
            return (latRad * 180.0 / System.Math.PI, lng);
        }

        public static int ParseZoom(string tileKey)
        {
            var parts = tileKey.Split(':');
            return int.Parse(parts[1]);
        }
    }
}
