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

            var (minX, maxY) = TileCoordinate.FromLatLng(request.MinLat, request.MinLng, zoom);
            var (maxX, minY) = TileCoordinate.FromLatLng(request.MaxLat, request.MaxLng, zoom);

            if (minX > maxX) (minX, maxX) = (maxX, minX);
            if (minY > maxY) (minY, maxY) = (maxY, minY);

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

            var tiles = counts
                .Where(kv => kv.Value > 0)
                .Select(kv =>
                {
                    var (x, y) = TileCoordinate.ParseTileKey(kv.Key);
                    return new HeatmapTileDto
                    {
                        X = x,
                        Y = y,
                        Zoom = zoom,
                        Count = kv.Value
                    };
                })
                .ToList();

            return new Response<List<HeatmapTileDto>>(tiles);
        }
    }
}
