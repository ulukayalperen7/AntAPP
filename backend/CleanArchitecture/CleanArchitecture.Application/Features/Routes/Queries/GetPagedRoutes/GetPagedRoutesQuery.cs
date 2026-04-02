
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Routes.Queries.GetPagedRoutes
{
    public class GetPagedRoutesQuery : IRequest<PagedResponse<RouteListViewModel>>
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        /// <summary>
        /// Optional: Filter by Category Tag
        /// </summary>
        public Guid? CategoryId { get; set; }
        /// <summary>
        /// Optional: Filter by Title or Description
        /// </summary>
        public string SearchTerm { get; set; }
    }

    /// <summary>
    /// A lighter representation of the Route, used for lists/feeds.
    /// Does not include the massive array of spots.
    /// </summary>
    public class RouteListViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
        public Guid AuthorUserId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class GetPagedRoutesQueryHandler : IRequestHandler<GetPagedRoutesQuery, PagedResponse<RouteListViewModel>>
    {
        private readonly IRouteRepositoryAsync _routeRepository;

        public GetPagedRoutesQueryHandler(IRouteRepositoryAsync routeRepository)
        {
            _routeRepository = routeRepository;
        }

        public async Task<PagedResponse<RouteListViewModel>> Handle(GetPagedRoutesQuery request, CancellationToken cancellationToken)
        {
            // Validate Paging parameters
            var validFilter = new CleanArchitecture.Core.Filters.RequestParameter(request.PageNumber, request.PageSize);
            
            var routes = await _routeRepository.GetPagedRoutesAsync(
                validFilter.PageNumber, 
                validFilter.PageSize, 
                request.CategoryId, 
                request.SearchTerm);
                
            var totalRecords = await _routeRepository.GetTotalRoutesCountAsync(request.CategoryId, request.SearchTerm);

            // Manual mapping
            var viewModelList = routes.Select(r => new RouteListViewModel
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                ThumbnailUrl = r.ThumbnailUrl,
                AuthorUserId = r.AuthorUserId,
                CreatedAt = r.CreatedAt
            }).ToList();

            return new PagedResponse<RouteListViewModel>(viewModelList, validFilter.PageNumber, validFilter.PageSize)
            {
                TotalRecords = totalRecords
            };
        }
    }
}
