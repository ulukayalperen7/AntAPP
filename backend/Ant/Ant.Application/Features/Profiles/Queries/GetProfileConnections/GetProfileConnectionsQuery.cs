using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using Ant.Core.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Profiles.Queries.GetProfileConnections
{
    public class GetProfileConnectionsQuery : IRequest<Response<List<ProfileConnectionViewModel>>>
    {
        public Guid UserId { get; set; }
        public string Type { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class ProfileConnectionViewModel
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public string ProfilePhotoUrl { get; set; }
        public bool IsCurrentUser { get; set; }
        public bool IsFollowingByCurrentUser { get; set; }
    }

    public class GetProfileConnectionsQueryHandler : IRequestHandler<GetProfileConnectionsQuery, Response<List<ProfileConnectionViewModel>>>
    {
        private readonly IGenericRepositoryAsync<User> _userRepository;
        private readonly IUserFollowRepositoryAsync _followRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IIdentityService _identityService;

        public GetProfileConnectionsQueryHandler(
            IGenericRepositoryAsync<User> userRepository,
            IUserFollowRepositoryAsync followRepository,
            IAuthenticatedUserService authenticatedUser,
            IIdentityService identityService)
        {
            _userRepository = userRepository;
            _followRepository = followRepository;
            _authenticatedUser = authenticatedUser;
            _identityService = identityService;
        }

        public async Task<Response<List<ProfileConnectionViewModel>>> Handle(GetProfileConnectionsQuery request, CancellationToken cancellationToken)
        {
            var pageNumber = Math.Max(1, request.PageNumber);
            var pageSize = Math.Clamp(request.PageSize, 1, 100);
            var type = request.Type?.Trim().ToLowerInvariant();

            var profileUser = await _userRepository.GetByIdAsync(request.UserId);
            if (profileUser == null)
            {
                await _identityService.GetUserIdentityAsync(request.UserId);
            }

            var follows = type == "following"
                ? await _followRepository.GetFollowingAsync(request.UserId, pageNumber, pageSize)
                : await _followRepository.GetFollowersAsync(request.UserId, pageNumber, pageSize);

            Guid? currentUserId = null;
            if (!string.IsNullOrEmpty(_authenticatedUser.UserId) && Guid.TryParse(_authenticatedUser.UserId, out var parsedUserId))
            {
                currentUserId = parsedUserId;
            }

            var items = new List<ProfileConnectionViewModel>();
            foreach (var follow in follows)
            {
                var user = type == "following" ? follow.FollowingUser : follow.FollowerUser;
                var userId = type == "following" ? follow.FollowingUserId : follow.FollowerUserId;
                var userName = user?.UserName;

                if (string.IsNullOrWhiteSpace(userName))
                {
                    var identity = await _identityService.GetUserIdentityAsync(userId);
                    userName = identity.UserName;
                }

                items.Add(new ProfileConnectionViewModel
                {
                    Id = userId,
                    UserName = userName,
                    ProfilePhotoUrl = user?.ProfilePhotoUrl,
                    IsCurrentUser = currentUserId == userId,
                    IsFollowingByCurrentUser = currentUserId.HasValue
                        && currentUserId.Value != userId
                        && await _followRepository.IsFollowingAsync(currentUserId.Value, userId)
                });
            }

            return new Response<List<ProfileConnectionViewModel>>(items);
        }
    }
}
