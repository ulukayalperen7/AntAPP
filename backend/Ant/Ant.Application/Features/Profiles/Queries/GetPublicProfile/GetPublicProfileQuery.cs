using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using Ant.Core.Entities;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Profiles.Queries.GetPublicProfile
{
    public class GetPublicProfileQuery : IRequest<Response<PublicProfileViewModel>>
    {
        public Guid UserId { get; set; }
    }

    public class PublicProfileViewModel
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public string ProfilePhotoUrl { get; set; }
        public int FollowerCount { get; set; }
        public int FollowingCount { get; set; }
        public int PublicRouteCount { get; set; }
        public int PostCount { get; set; }
        public bool IsCurrentUser { get; set; }
        public bool IsFollowingByCurrentUser { get; set; }
    }

    public class GetPublicProfileQueryHandler : IRequestHandler<GetPublicProfileQuery, Response<PublicProfileViewModel>>
    {
        private readonly IGenericRepositoryAsync<User> _userRepository;
        private readonly IUserFollowRepositoryAsync _followRepository;
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IPostRepositoryAsync _postRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IIdentityService _identityService;

        public GetPublicProfileQueryHandler(
            IGenericRepositoryAsync<User> userRepository,
            IUserFollowRepositoryAsync followRepository,
            IRouteRepositoryAsync routeRepository,
            IPostRepositoryAsync postRepository,
            IAuthenticatedUserService authenticatedUser,
            IIdentityService identityService)
        {
            _userRepository = userRepository;
            _followRepository = followRepository;
            _routeRepository = routeRepository;
            _postRepository = postRepository;
            _authenticatedUser = authenticatedUser;
            _identityService = identityService;
        }

        public async Task<Response<PublicProfileViewModel>> Handle(GetPublicProfileQuery request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId);
            var fallbackUserName = user?.UserName;
            if (string.IsNullOrWhiteSpace(fallbackUserName))
            {
                var identity = await _identityService.GetUserIdentityAsync(request.UserId);
                fallbackUserName = identity?.UserName ?? "Unknown User";
            }

            Guid? currentUserId = null;
            if (!string.IsNullOrEmpty(_authenticatedUser.UserId) && Guid.TryParse(_authenticatedUser.UserId, out var parsedUserId))
            {
                currentUserId = parsedUserId;
            }

            var isCurrentUser = currentUserId == request.UserId;
            var isFollowing = currentUserId.HasValue
                && !isCurrentUser
                && await _followRepository.IsFollowingAsync(currentUserId.Value, request.UserId);

            var profile = new PublicProfileViewModel
            {
                Id = request.UserId,
                UserName = fallbackUserName,
                ProfilePhotoUrl = user?.ProfilePhotoUrl,
                FollowerCount = await _followRepository.GetFollowerCountAsync(request.UserId),
                FollowingCount = await _followRepository.GetFollowingCountAsync(request.UserId),
                PublicRouteCount = await _routeRepository.GetTotalRoutesCountAsync(authorId: request.UserId, visibility: "public"),
                PostCount = await _postRepository.GetFeedPostsCountAsync(null, request.UserId),
                IsCurrentUser = isCurrentUser,
                IsFollowingByCurrentUser = isFollowing
            };

            return new Response<PublicProfileViewModel>(profile);
        }
    }
}
