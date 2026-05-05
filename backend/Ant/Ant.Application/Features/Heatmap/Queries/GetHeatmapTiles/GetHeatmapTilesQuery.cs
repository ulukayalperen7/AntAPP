using Ant.Application.Common.Heatmap;
using Ant.Application.DTOs;
using Ant.Application.Interfaces;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Heatmap.Queries.GetHeatmapTiles
{
    public class GetHeatmapTilesQuery : IRequest<Response<List<HeatmapTileDto>>>
    {
        public double MinLat { get; set; }
        public double MinLng { get; set; }
        public double MaxLat { get; set; }
        public double MaxLng { get; set; }
        public int Zoom { get; set; } = TileCoordinate.DefaultZoom;
    }

    public class GetHeatmapTilesQueryHandler : IRequestHandler<GetHeatmapTilesQuery, Response<List<HeatmapTileDto>>>
    {
        private readonly IHeatmapService _heatmapService;
        private const int MaxTilesPerRequest = 10000;

        public GetHeatmapTilesQueryHandler(IHeatmapService heatmapService)
        {
            _heatmapService = heatmapService;
        }

        public async Task<Response<List<HeatmapTileDto>>> Handle(GetHeatmapTilesQuery request, CancellationToken cancellationToken)
        {
            var zoom = Math.Clamp(request.Zoom, 1, 18);
            var storageZoom = TileCoordinate.DefaultZoom;

            var (minX, maxY) = TileCoordinate.FromLatLng(request.MinLat, request.MinLng, zoom);
            var (maxX, minY) = TileCoordinate.FromLatLng(request.MaxLat, request.MaxLng, zoom);

            if (minX > maxX) (minX, maxX) = (maxX, minX);
            if (minY > maxY) (minY, maxY) = (maxY, minY);

            if (zoom >= storageZoom)
            {
                var tileCount = (long)(maxX - minX + 1) * (maxY - minY + 1);
                if (tileCount > MaxTilesPerRequest)
                {
                    return new Response<List<HeatmapTileDto>>(
                        $"Bounding box too large: {tileCount} tiles requested, max is {MaxTilesPerRequest}. Zoom in or reduce the area.");
                }

                var tileKeys = new List<string>();
                for (var x = minX; x <= maxX; x++)
                {
                    for (var y = minY; y <= maxY; y++)
                    {
                        tileKeys.Add(TileCoordinate.ToTileKey(x, y, zoom));
                    }
                }

                var counts = await _heatmapService.GetTileCountsAsync(tileKeys, cancellationToken);

                var exact = counts
                    .Where(kv => kv.Value > 0)
                    .Select(kv =>
                    {
                        var (x, y) = TileCoordinate.ParseTileKey(kv.Key);
                        var (cLat, cLng) = TileCoordinate.TileCenter(x, y, zoom);
                        return new HeatmapTileDto
                        {
                            X = x,
                            Y = y,
                            Zoom = zoom,
                            Count = kv.Value,
                            CentroidLat = cLat,
                            CentroidLng = cLng,
                        };
                    })
                    .ToList();

                return new Response<List<HeatmapTileDto>>(exact);
            }

            var shift = storageZoom - zoom;
            var allTiles = await _heatmapService.GetAllActiveTilesAsync(cancellationToken);
            var aggregated = new Dictionary<(int X, int Y), (long Count, double LatSum, double LngSum)>();

            foreach (var (key, count) in allTiles)
            {
                if (TileCoordinate.ParseZoom(key) != storageZoom) continue;
                var (x14, y14) = TileCoordinate.ParseTileKey(key);
                var parentX = x14 >> shift;
                var parentY = y14 >> shift;
                if (parentX < minX || parentX > maxX || parentY < minY || parentY > maxY) continue;

                var (childLat, childLng) = TileCoordinate.TileCenter(x14, y14, storageZoom);
                var bucket = (parentX, parentY);
                aggregated.TryGetValue(bucket, out var existing);
                aggregated[bucket] = (
                    existing.Count + count,
                    existing.LatSum + childLat * count,
                    existing.LngSum + childLng * count
                );
            }

            var tiles = aggregated
                .Select(kv => new HeatmapTileDto
                {
                    X = kv.Key.X,
                    Y = kv.Key.Y,
                    Zoom = zoom,
                    Count = kv.Value.Count,
                    CentroidLat = kv.Value.LatSum / kv.Value.Count,
                    CentroidLng = kv.Value.LngSum / kv.Value.Count,
                })
                .ToList();

            return new Response<List<HeatmapTileDto>>(tiles);
        }
    }
}
