using Ant.Application.Interfaces;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Account.Commands.UpdateUserRoles
{
    public class UpdateUserRolesCommand : IRequest<Response<Guid>>
    {
        public Guid UserId { get; set; }
        public List<string> Roles { get; set; }
    }

    public class UpdateUserRolesCommandHandler : IRequestHandler<UpdateUserRolesCommand, Response<Guid>>
    {
        private readonly IIdentityService _identityService;

        public UpdateUserRolesCommandHandler(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        public async Task<Response<Guid>> Handle(UpdateUserRolesCommand request, CancellationToken cancellationToken)
        {
            await _identityService.UpdateUserRolesAsync(request.UserId, request.Roles);
            return new Response<Guid>(request.UserId, message: "User roles updated successfully.");
        }
    }
}
