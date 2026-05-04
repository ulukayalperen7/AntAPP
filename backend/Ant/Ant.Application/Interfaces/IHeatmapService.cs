using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces
{
    public interface IHeatmapService
    {
        Task<bool> UpdateUserLocationAsync(string tokenHash, string newTileKey, CancellationToken cancellationToken = default);
        Task<Dictionary<string, long>> GetTileCountsAsync(IEnumerable<string> tileKeys, CancellationToken cancellationToken = default);
        Task<int> SweepExpiredUsersAsync(TimeSpan maxInactivity, CancellationToken cancellationToken = default);
    }
}
