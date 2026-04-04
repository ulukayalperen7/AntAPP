using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Account.Commands.ChangePassword
{
    public class ChangePasswordCommand : IRequest<Response<string>>
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmNewPassword { get; set; }
    }

    public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Response<string>>
    {
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IIdentityService _identityService;

        public ChangePasswordCommandHandler(
            IAuthenticatedUserService authenticatedUser,
            IIdentityService identityService)
        {
            _authenticatedUser = authenticatedUser;
            _identityService = identityService;
        }

        public async Task<Response<string>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            if (request.NewPassword != request.ConfirmNewPassword)
                throw new ApiException("New password and confirmation do not match.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            await _identityService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);

            return new Response<string>("Password changed successfully.");
        }
    }
}
