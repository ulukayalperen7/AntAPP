using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Account.Commands.UpdateProfile
{
    public class UpdateProfileCommand : IRequest<Response<Guid>>
    {
        public string UserName { get; set; }
        public string ProfilePhotoUrl { get; set; }
    }

    public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Response<Guid>>
    {
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IGenericRepositoryAsync<User> _userRepository;

        public UpdateProfileCommandHandler(
            IAuthenticatedUserService authenticatedUser,
            IGenericRepositoryAsync<User> userRepository)
        {
            _authenticatedUser = authenticatedUser;
            _userRepository = userRepository;
        }

        public async Task<Response<Guid>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new EntityNotFoundException(nameof(User), userId);

            if (!string.IsNullOrWhiteSpace(request.UserName))
                user.UserName = request.UserName;

            if (request.ProfilePhotoUrl != null)
                user.ProfilePhotoUrl = request.ProfilePhotoUrl;

            await _userRepository.UpdateAsync(user);
            return new Response<Guid>(userId, message: "Profile updated successfully.");
        }
    }
}
