using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces
{
    public interface IHeatmapService
    {
        Task<string> GetUserIdByTokenAsync(string tokenHash, CancellationToken cancellationToken = default);
        Task RegisterTokenAsync(string tokenHash, string userId, CancellationToken cancellationToken = default);
        Task<bool> UpdateUserLocationAsync(string userId, string newTileKey, CancellationToken cancellationToken = default);
        Task<Dictionary<string, long>> GetTileCountsAsync(IEnumerable<string> tileKeys, CancellationToken cancellationToken = default);
        Task<int> SweepExpiredUsersAsync(TimeSpan maxInactivity, CancellationToken cancellationToken = default);
    }
}
