using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Account.Queries.GetCurrentUser
{
    public class GetCurrentUserQuery : IRequest<Response<CurrentUserViewModel>>
    {
    }

    public class CurrentUserViewModel
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string ProfilePhotoUrl { get; set; }
        public bool IsVerified { get; set; }
        public List<string> Roles { get; set; }
    }

    public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, Response<CurrentUserViewModel>>
    {
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IGenericRepositoryAsync<User> _userRepository;
        private readonly IIdentityService _identityService;

        public GetCurrentUserQueryHandler(
            IAuthenticatedUserService authenticatedUser,
            IGenericRepositoryAsync<User> userRepository,
            IIdentityService identityService)
        {
            _authenticatedUser = authenticatedUser;
            _userRepository = userRepository;
            _identityService = identityService;
        }

        public async Task<Response<CurrentUserViewModel>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new EntityNotFoundException(nameof(User), userId);

            var identity = await _identityService.GetUserIdentityAsync(userId);

            return new Response<CurrentUserViewModel>(new CurrentUserViewModel
            {
                Id = userId,
                UserName = user.UserName,
                Email = identity.Email,
                ProfilePhotoUrl = user.ProfilePhotoUrl,
                IsVerified = identity.IsVerified,
                Roles = identity.Roles
            });
        }
    }
}
