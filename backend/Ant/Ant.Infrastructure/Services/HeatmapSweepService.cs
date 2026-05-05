using Ant.Application.Interfaces;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Services
{
    public class HeatmapSweepService : BackgroundService
    {
        private static readonly TimeSpan SweepInterval = TimeSpan.FromSeconds(60);
        private static readonly TimeSpan MaxInactivity = TimeSpan.FromMinutes(5);

        private readonly IHeatmapService _heatmapService;
        private readonly ILogger<HeatmapSweepService> _logger;

        public HeatmapSweepService(IHeatmapService heatmapService, ILogger<HeatmapSweepService> logger)
        {
            _heatmapService = heatmapService;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(SweepInterval, stoppingToken);
                    var evicted = await _heatmapService.SweepExpiredUsersAsync(MaxInactivity, stoppingToken);

                    if (evicted > 0)
                    {
                        _logger.LogInformation("Heatmap sweep evicted {Count} inactive users", evicted);
                    }
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Heatmap sweep failed");
                }
            }
        }
    }
}
