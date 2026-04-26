using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using Ant.Core.Entities;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Profiles.Commands.ToggleUserFollow
{
    public class ToggleUserFollowCommand : IRequest<Response<UserFollowSummaryViewModel>>
    {
        public Guid UserId { get; set; }
    }

    public class UserFollowSummaryViewModel
    {
        public Guid UserId { get; set; }
        public bool IsFollowingByCurrentUser { get; set; }
        public int FollowerCount { get; set; }
        public int FollowingCount { get; set; }
    }

    public class ToggleUserFollowCommandHandler : IRequestHandler<ToggleUserFollowCommand, Response<UserFollowSummaryViewModel>>
    {
        private readonly IGenericRepositoryAsync<User> _userRepository;
        private readonly IUserFollowRepositoryAsync _followRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public ToggleUserFollowCommandHandler(
            IGenericRepositoryAsync<User> userRepository,
            IUserFollowRepositoryAsync followRepository,
            IAuthenticatedUserService authenticatedUser)
        {
            _userRepository = userRepository;
            _followRepository = followRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Response<UserFollowSummaryViewModel>> Handle(ToggleUserFollowCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var currentUserId = Guid.Parse(_authenticatedUser.UserId);
            if (currentUserId == request.UserId)
                throw new ApiException("You cannot follow yourself.");

            var targetUser = await _userRepository.GetByIdAsync(request.UserId);
            if (targetUser == null)
                throw new ApiException("Profile not found.");

            var existing = await _followRepository.GetFollowAsync(currentUserId, request.UserId);
            var isFollowing = existing == null;

            if (existing == null)
            {
                await _followRepository.AddAsync(new UserFollow
                {
                    FollowerUserId = currentUserId,
                    FollowingUserId = request.UserId
                });
            }
            else
            {
                await _followRepository.DeleteAsync(existing);
            }

            return new Response<UserFollowSummaryViewModel>(new UserFollowSummaryViewModel
            {
                UserId = request.UserId,
                IsFollowingByCurrentUser = isFollowing,
                FollowerCount = await _followRepository.GetFollowerCountAsync(request.UserId),
                FollowingCount = await _followRepository.GetFollowingCountAsync(request.UserId)
            });
        }
    }
}
