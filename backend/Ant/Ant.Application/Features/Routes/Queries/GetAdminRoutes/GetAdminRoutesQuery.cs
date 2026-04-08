using Ant.Core.Enums;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;

namespace Ant.Application.Features.Routes.Queries.GetAdminRoutes
{
    public class GetAdminRoutesQuery : IRequest<PagedResponse<AdminRouteViewModel>>
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public string SearchValue { get; set; }
    }

    public class AdminRouteViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string AuthorUserName { get; set; }
        public RouteContentTypeEnum ContentType { get; set; }
        public bool IsPublic { get; set; }
        public DateTime CreatedAt { get; set; }
        public int StopCount { get; set; }
        public double AverageRating { get; set; }
    }
}
