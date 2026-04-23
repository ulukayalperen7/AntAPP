using Ant.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Caching
{
    public class AppMemoryCacheService : IAppCacheService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly ConcurrentDictionary<string, byte> _keys = new(StringComparer.Ordinal);
        private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new(StringComparer.Ordinal);

        public AppMemoryCacheService(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
        }

        public async Task<T> GetOrCreateAsync<T>(string key, Func<CancellationToken, Task<T>> factory, TimeSpan ttl, CancellationToken cancellationToken = default)
        {
            if (_memoryCache.TryGetValue(key, out T cachedValue))
            {
                return cachedValue;
            }

            var cacheLock = _locks.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));
            await cacheLock.WaitAsync(cancellationToken);

            try
            {
                if (_memoryCache.TryGetValue(key, out cachedValue))
                {
                    return cachedValue;
                }

                var value = await factory(cancellationToken);
                var options = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = ttl
                };

                options.RegisterPostEvictionCallback(static (evictedKey, _, _, state) =>
                {
                    if (evictedKey is not string cacheKey || state is not ConcurrentDictionary<string, byte> keys)
                    {
                        return;
                    }

                    keys.TryRemove(cacheKey, out _);
                }, _keys);

                _memoryCache.Set(key, value, options);
                _keys[key] = 0;

                return value;
            }
            finally
            {
                cacheLock.Release();
                if (cacheLock.CurrentCount == 1)
                {
                    _locks.TryRemove(key, out _);
                }
            }
        }

        public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
        {
            _memoryCache.Remove(key);
            _keys.TryRemove(key, out _);
            _locks.TryRemove(key, out _);
            return Task.CompletedTask;
        }

        public Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
        {
            var keysToRemove = _keys.Keys
                .Where(key => key.StartsWith(prefix, StringComparison.Ordinal))
                .ToList();

            foreach (var key in keysToRemove)
            {
                _memoryCache.Remove(key);
                _keys.TryRemove(key, out _);
                _locks.TryRemove(key, out _);
            }

            return Task.CompletedTask;
        }
    }
}
