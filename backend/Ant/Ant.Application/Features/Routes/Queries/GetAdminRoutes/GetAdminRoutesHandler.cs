using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Routes.Queries.GetAdminRoutes
{
    public class GetAdminRoutesQueryHandler : IRequestHandler<GetAdminRoutesQuery, PagedResponse<AdminRouteViewModel>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;

        public GetAdminRoutesQueryHandler(IRouteRepositoryAsync routeRepository)
        {
            _routeRepository = routeRepository;
        }

        public async Task<PagedResponse<AdminRouteViewModel>> Handle(GetAdminRoutesQuery request, CancellationToken cancellationToken)
        {
            var routes = await _routeRepository.GetPagedRoutesAsync(
                request.PageNumber, request.PageSize, request.SearchValue);

            var totalRecords = await _routeRepository.GetTotalRoutesCountAsync(request.SearchValue);

            var data = routes.Select(x => new AdminRouteViewModel
            {
                Id = x.Id,
                Title = x.Title,
                AuthorUserName = x.AuthorUser != null ? x.AuthorUser.UserName : "System",
                ContentType = x.ContentType,
                IsPublic = x.IsPublic,
                CreatedAt = x.CreatedAt,
                StopCount = x.RouteSpots != null ? x.RouteSpots.Count : 0,
                AverageRating = x.RatingCount > 0 ? (double)x.RatingSum / x.RatingCount : 0
            }).ToList();

            return new PagedResponse<AdminRouteViewModel>(data, request.PageNumber, request.PageSize)
            {
                TotalRecords = totalRecords
            };
        }
    }
}
