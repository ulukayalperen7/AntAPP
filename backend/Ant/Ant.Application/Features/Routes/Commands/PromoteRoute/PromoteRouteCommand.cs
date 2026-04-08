using Ant.Application.Wrappers;
using Ant.Core.Enums;
using MediatR;
using System;

namespace Ant.Application.Features.Routes.Commands.PromoteRoute
{
    public class PromoteRouteCommand : IRequest<Response<Guid>>
    {
        public Guid Id { get; set; }
        public RouteContentTypeEnum NewType { get; set; }
    }
}
