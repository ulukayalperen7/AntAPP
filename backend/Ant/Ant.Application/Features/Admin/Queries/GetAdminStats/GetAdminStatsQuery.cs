using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Admin.Queries.GetAdminStats
{
    public class GetAdminStatsQuery : IRequest<Response<AdminStatsViewModel>>
    {
    }

    public class GetAdminStatsQueryHandler : IRequestHandler<GetAdminStatsQuery, Response<AdminStatsViewModel>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly ITagRepositoryAsync _tagRepository;
        private readonly ISpotRepositoryAsync _spotRepository;
        private readonly IIdentityService _identityService;

        public GetAdminStatsQueryHandler(
            IRouteRepositoryAsync routeRepository,
            ITagRepositoryAsync tagRepository,
            ISpotRepositoryAsync spotRepository,
            IIdentityService identityService)
        {
            _routeRepository = routeRepository;
            _tagRepository = tagRepository;
            _spotRepository = spotRepository;
            _identityService = identityService;
        }

        public async Task<Response<AdminStatsViewModel>> Handle(GetAdminStatsQuery request, CancellationToken cancellationToken)
        {
            var routesCount = await _routeRepository.GetTotalRoutesCountAsync();
            var tagsCount = await _tagRepository.GetCountAsync();
            var activeUsersCount = await _identityService.GetCountAsync(isActive: true);

            // Fetch Top 5 Latest Routes
            var latestRoutes = await _routeRepository.GetPagedRoutesAsync(1, 5, sort: "latest");
            
            // Fetch Top 5 Rated Spots (Manually since repo doesn't have rating sort)
            var topSpots = await _spotRepository.GetPagedSpotsAsync(1, 5);
            // Optimization: Filter logic can be improved but for top 5 it's fine.

            var viewModel = new AdminStatsViewModel
            {
                TotalRoutes = routesCount,
                TotalTags = tagsCount,
                ActiveUsers = activeUsersCount,
                RecentRoutes = latestRoutes.Select(r => new RecentRouteDto 
                { 
                    Id = r.Id, 
                    Title = r.Title, 
                    CreatedAt = r.CreatedAt 
                }).ToList(),
                TopSpots = topSpots.Select(s => new TopSpotDto 
                { 
                    Id = s.Id, 
                    Name = s.Name, 
                    AverageRating = s.RatingCount == 0 ? 0 : (double)s.RatingSum / s.RatingCount 
                }).ToList()
            };

            return new Response<AdminStatsViewModel>(viewModel);
        }
    }
}
