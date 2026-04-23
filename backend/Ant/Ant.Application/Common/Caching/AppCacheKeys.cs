using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace Ant.Application.Common.Caching
{
    public static class AppCacheKeys
    {
        public const string RoutesPrefix = "routes:";
        public const string SpotsPrefix = "spots:";
        public const string TagsPrefix = "tags:";

        public static string RouteList(
            int pageNumber,
            int pageSize,
            string search,
            Guid? tagId,
            IEnumerable<Guid> tagIds,
            string sort,
            double? nearLat,
            double? nearLng,
            double? radiusKm,
            Guid? authorId,
            string visibility,
            string type)
        {
            var normalizedTagIds = tagIds is null
                ? string.Empty
                : string.Join(',', tagIds.OrderBy(id => id));

            return string.Join('|',
                $"{RoutesPrefix}list",
                pageNumber,
                pageSize,
                search ?? string.Empty,
                tagId?.ToString() ?? string.Empty,
                normalizedTagIds,
                sort ?? string.Empty,
                Format(nearLat),
                Format(nearLng),
                Format(radiusKm),
                authorId?.ToString() ?? string.Empty,
                visibility ?? string.Empty,
                type ?? string.Empty);
        }

        public static string RouteDetail(Guid routeId) => $"{RoutesPrefix}detail:{routeId}";

        public static string NearbyRoutes(double latitude, double longitude, double radiusInMeters, int pageNumber, int pageSize)
            => string.Join('|', $"{RoutesPrefix}nearby", Format(latitude), Format(longitude), Format(radiusInMeters), pageNumber, pageSize);

        public static string SpotList(int pageNumber, int pageSize, string search)
            => string.Join('|', $"{SpotsPrefix}list", pageNumber, pageSize, search ?? string.Empty);

        public static string SpotDetail(Guid spotId) => $"{SpotsPrefix}detail:{spotId}";

        public static string SpotRoutes(Guid spotId, int pageNumber, int pageSize)
            => string.Join('|', $"{SpotsPrefix}routes", spotId, pageNumber, pageSize);

        public static string TagList(int pageNumber, int pageSize)
            => string.Join('|', $"{TagsPrefix}list", pageNumber, pageSize);

        private static string Format(double? value)
            => value?.ToString("G17", CultureInfo.InvariantCulture) ?? string.Empty;
    }
}
