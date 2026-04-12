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
        private readonly IIdentityService _identityService;

        public GetAdminStatsQueryHandler(
            IRouteRepositoryAsync routeRepository,
            ITagRepositoryAsync tagRepository,
            IIdentityService identityService)
        {
            _routeRepository = routeRepository;
            _tagRepository = tagRepository;
            _identityService = identityService;
        }

        public async Task<Response<AdminStatsViewModel>> Handle(GetAdminStatsQuery request, CancellationToken cancellationToken)
        {
            var routesCount = await _routeRepository.GetTotalRoutesCountAsync();
            var tagsCount = await _tagRepository.GetCountAsync();
            var activeUsersCount = await _identityService.GetCountAsync(isActive: true);

            var viewModel = new AdminStatsViewModel
            {
                TotalRoutes = routesCount,
                TotalTags = tagsCount,
                ActiveUsers = activeUsersCount
            };

            return new Response<AdminStatsViewModel>(viewModel);
        }
    }
}
