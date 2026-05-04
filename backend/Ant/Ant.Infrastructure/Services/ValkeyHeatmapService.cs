using Ant.Application.Interfaces;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Services
{
    public class ValkeyHeatmapService : IHeatmapService
    {
        private const string TokenMapKey = "antapp:heatmap:tokens";
        private const string UsersHashKey = "antapp:heatmap:users";
        private const string TilesHashKey = "antapp:heatmap:tiles";
        private const string ActivitySortedSetKey = "antapp:heatmap:activity";

        private static readonly string UpdateScript = """
            local oldTile = redis.call("HGET", KEYS[1], ARGV[1])

            redis.call("ZADD", KEYS[3], ARGV[3], ARGV[1])

            if oldTile then
                if oldTile == ARGV[2] then
                    return 0
                end
                redis.call("HINCRBY", KEYS[2], oldTile, -1)
            end

            redis.call("HINCRBY", KEYS[2], ARGV[2], 1)
            redis.call("HSET", KEYS[1], ARGV[1], ARGV[2])
            return 1
            """;

        private static readonly string SweepScript = """
            local expired = redis.call("ZRANGEBYSCORE", KEYS[1], "-inf", ARGV[1])

            for _, userId in ipairs(expired) do
                local tile = redis.call("HGET", KEYS[2], userId)
                if tile then
                    redis.call("HINCRBY", KEYS[3], tile, -1)
                    redis.call("HDEL", KEYS[2], userId)
                end
            end

            redis.call("ZREMRANGEBYSCORE", KEYS[1], "-inf", ARGV[1])
            return #expired
            """;

        private readonly IDatabase _database;

        public ValkeyHeatmapService(IConnectionMultiplexer connectionMultiplexer)
        {
            _database = connectionMultiplexer.GetDatabase();
        }

        public async Task<string> GetUserIdByTokenAsync(string tokenHash, CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var userId = await _database.HashGetAsync(TokenMapKey, tokenHash);
            return userId.HasValue ? userId.ToString() : null;
        }

        public async Task RegisterTokenAsync(string tokenHash, string userId, CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            await _database.HashSetAsync(TokenMapKey, tokenHash, userId);
        }

        public async Task<bool> UpdateUserLocationAsync(string userId, string newTileKey, CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            var result = await _database.ScriptEvaluateAsync(
                UpdateScript,
                new RedisKey[] { UsersHashKey, TilesHashKey, ActivitySortedSetKey },
                new RedisValue[] { userId, newTileKey, timestamp });

            return (int)result == 1;
        }

        public async Task<Dictionary<string, long>> GetTileCountsAsync(IEnumerable<string> tileKeys, CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var keys = tileKeys.ToArray();
            if (keys.Length == 0)
                return new Dictionary<string, long>();

            var hashFields = keys.Select(k => (RedisValue)k).ToArray();
            var values = await _database.HashGetAsync(TilesHashKey, hashFields);

            var result = new Dictionary<string, long>(keys.Length);
            for (var i = 0; i < keys.Length; i++)
            {
                if (values[i].HasValue && values[i].TryParse(out long count))
                {
                    result[keys[i]] = count;
                }
            }

            return result;
        }

        public async Task<int> SweepExpiredUsersAsync(TimeSpan maxInactivity, CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var cutoff = DateTimeOffset.UtcNow.Subtract(maxInactivity).ToUnixTimeSeconds();

            var result = await _database.ScriptEvaluateAsync(
                SweepScript,
                new RedisKey[] { ActivitySortedSetKey, UsersHashKey, TilesHashKey },
                new RedisValue[] { cutoff });

            return (int)result;
        }
    }
}
