using Ant.Application.Interfaces;
using StackExchange.Redis;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Caching
{
    public class ValkeyAppCacheService : IAppCacheService
    {
        private const string KeyIndexSet = "antapp:cache:keys";
        private static readonly TimeSpan LockTimeout = TimeSpan.FromSeconds(10);
        private static readonly TimeSpan LockRetryDelay = TimeSpan.FromMilliseconds(50);
        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

        private readonly IDatabase _database;

        public ValkeyAppCacheService(IConnectionMultiplexer connectionMultiplexer)
        {
            _database = connectionMultiplexer.GetDatabase();
        }

        public async Task<T> GetOrCreateAsync<T>(string key, Func<CancellationToken, Task<T>> factory, TimeSpan ttl, CancellationToken cancellationToken = default)
        {
            var cachedValue = await GetAsync<T>(key);
            if (cachedValue.HasValue)
            {
                return cachedValue.Value;
            }

            var lockKey = GetLockKey(key);
            var lockToken = Guid.NewGuid().ToString("N");
            var lockAcquired = await TryAcquireLockAsync(lockKey, lockToken, cancellationToken);

            if (!lockAcquired)
            {
                var valueWithoutLock = await factory(cancellationToken);
                await SetAsync(key, valueWithoutLock, ttl);
                return valueWithoutLock;
            }

            try
            {
                cachedValue = await GetAsync<T>(key);
                if (cachedValue.HasValue)
                {
                    return cachedValue.Value;
                }

                var value = await factory(cancellationToken);
                await SetAsync(key, value, ttl);

                return value;
            }
            finally
            {
                await ReleaseLockAsync(lockKey, lockToken);
            }
        }

        public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            await _database.KeyDeleteAsync(key);
            await _database.SetRemoveAsync(KeyIndexSet, key);
        }

        public async Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
        {
            var keys = await _database.SetMembersAsync(KeyIndexSet);
            var matchingKeys = keys
                .Where(key => key.HasValue && key.ToString().StartsWith(prefix, StringComparison.Ordinal))
                .ToArray();

            cancellationToken.ThrowIfCancellationRequested();

            if (matchingKeys.Length == 0)
            {
                return;
            }

            var redisKeys = matchingKeys.Select(key => (RedisKey)key.ToString()).ToArray();
            await _database.KeyDeleteAsync(redisKeys);
            await _database.SetRemoveAsync(KeyIndexSet, matchingKeys);
        }

        private async Task<CacheValue<T>> GetAsync<T>(string key)
        {
            var value = await _database.StringGetAsync(key);
            if (!value.HasValue)
            {
                return CacheValue<T>.Empty;
            }

            return CacheValue<T>.FromValue(JsonSerializer.Deserialize<T>(value!, JsonOptions));
        }

        private async Task SetAsync<T>(string key, T value, TimeSpan ttl)
        {
            var serializedValue = JsonSerializer.Serialize(value, JsonOptions);
            await _database.StringSetAsync(key, serializedValue, ttl);
            await _database.SetAddAsync(KeyIndexSet, key);
        }

        private async Task<bool> TryAcquireLockAsync(string lockKey, string lockToken, CancellationToken cancellationToken)
        {
            var timeoutAt = DateTimeOffset.UtcNow.Add(LockTimeout);

            while (DateTimeOffset.UtcNow < timeoutAt)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _database.StringSetAsync(lockKey, lockToken, LockTimeout, When.NotExists))
                {
                    return true;
                }

                await Task.Delay(LockRetryDelay, cancellationToken);
            }

            return false;
        }

        private Task ReleaseLockAsync(string lockKey, string lockToken)
        {
            const string script = """
                if redis.call("get", KEYS[1]) == ARGV[1] then
                    return redis.call("del", KEYS[1])
                end

                return 0
                """;

            return _database.ScriptEvaluateAsync(script, new RedisKey[] { lockKey }, new RedisValue[] { lockToken });
        }

        private static string GetLockKey(string key)
        {
            return $"antapp:cache:lock:{key}";
        }

        private readonly struct CacheValue<T>
        {
            private CacheValue(T value, bool hasValue)
            {
                Value = value;
                HasValue = hasValue;
            }

            public T Value { get; }
            public bool HasValue { get; }

            public static CacheValue<T> Empty => new(default, false);

            public static CacheValue<T> FromValue(T value)
            {
                return new CacheValue<T>(value, true);
            }
        }
    }
}
