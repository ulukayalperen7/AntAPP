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
            
            // For tags, GetAllTags exists in application layer but repository has IGenericRepositoryAsync.GetCountAsync?
            // Let's use GetAllAsync if count isn't direct
            var tags = await _tagRepository.GetAllAsync();
            var tagsCount = tags.Count;

            var users = await _identityService.GetAllUsersAsync();
            var activeUsersCount = users.Count(u => u.IsActive);

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
