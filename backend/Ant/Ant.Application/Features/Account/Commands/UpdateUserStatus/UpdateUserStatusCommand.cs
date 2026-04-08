using Ant.Application.Interfaces;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Account.Commands.UpdateUserStatus
{
    public class UpdateUserStatusCommand : IRequest<Response<Guid>>
    {
        public Guid UserId { get; set; }
        public bool IsActive { get; set; }
    }

    public class UpdateUserStatusCommandHandler : IRequestHandler<UpdateUserStatusCommand, Response<Guid>>
    {
        private readonly IIdentityService _identityService;

        public UpdateUserStatusCommandHandler(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        public async Task<Response<Guid>> Handle(UpdateUserStatusCommand request, CancellationToken cancellationToken)
        {
            await _identityService.UpdateUserStatusAsync(request.UserId, request.IsActive);
            return new Response<Guid>(request.UserId, message: $"User status updated successfully to {(request.IsActive ? "Active" : "Inactive")}.");
        }
    }
}
