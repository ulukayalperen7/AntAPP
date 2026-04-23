using Microsoft.AspNetCore.OutputCaching;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.WebApi.Caching
{
    public static class OutputCachePolicies
    {
        public const string RoutesList = nameof(RoutesList);
        public const string RouteDetail = nameof(RouteDetail);
        public const string SpotsList = nameof(SpotsList);
        public const string SpotDetail = nameof(SpotDetail);
        public const string SpotRoutes = nameof(SpotRoutes);
        public const string TagsList = nameof(TagsList);
    }

    public static class OutputCacheTags
    {
        public const string Routes = "routes";
        public const string Spots = "spots";
        public const string Tags = "tags";

        public static ValueTask EvictRoutesAsync(IOutputCacheStore store, CancellationToken cancellationToken)
            => store.EvictByTagAsync(Routes, cancellationToken);

        public static ValueTask EvictSpotsAsync(IOutputCacheStore store, CancellationToken cancellationToken)
            => store.EvictByTagAsync(Spots, cancellationToken);

        public static ValueTask EvictTagsAsync(IOutputCacheStore store, CancellationToken cancellationToken)
            => store.EvictByTagAsync(Tags, cancellationToken);

        public static async Task EvictRoutesAndSpotsAsync(IOutputCacheStore store, CancellationToken cancellationToken)
        {
            await EvictRoutesAsync(store, cancellationToken);
            await EvictSpotsAsync(store, cancellationToken);
        }
    }
}
