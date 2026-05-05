using Ant.Application.Common.Heatmap;
using Ant.Application.Interfaces;
using Ant.Application.Wrappers;
using MediatR;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Heatmap.Commands.UpdateLocation
{
    public class UpdateLocationCommand : IRequest<Response<bool>>
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        [JsonIgnore]
        public string UserId { get; set; }
    }

    public class UpdateLocationCommandHandler : IRequestHandler<UpdateLocationCommand, Response<bool>>
    {
        private readonly IHeatmapService _heatmapService;

        public UpdateLocationCommandHandler(IHeatmapService heatmapService)
        {
            _heatmapService = heatmapService;
        }

        public async Task<Response<bool>> Handle(UpdateLocationCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.UserId))
            {
                return new Response<bool>("User identity could not be resolved.");
            }

            var tileKey = TileCoordinate.ToTileKey(request.Latitude, request.Longitude);
            var changed = await _heatmapService.UpdateUserLocationAsync(request.UserId, tileKey, cancellationToken);

            return new Response<bool>(changed);
        }
    }
}
