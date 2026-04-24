using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using Ant.Core.Entities;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Posts.Commands.SharePost
{
    public class SharePostCommand : IRequest<Response<PostShareSummaryViewModel>>
    {
        public Guid PostId { get; set; }
    }

    public class PostShareSummaryViewModel
    {
        public Guid PostId { get; set; }
        public bool IsSharedByCurrentUser { get; set; }
        public int ShareCount { get; set; }
    }

    public class SharePostCommandHandler : IRequestHandler<SharePostCommand, Response<PostShareSummaryViewModel>>
    {
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IPostRepositoryAsync _postRepository;
        private readonly IPostShareRepositoryAsync _shareRepository;

        public SharePostCommandHandler(
            IAuthenticatedUserService authenticatedUser,
            IPostRepositoryAsync postRepository,
            IPostShareRepositoryAsync shareRepository)
        {
            _authenticatedUser = authenticatedUser;
            _postRepository = postRepository;
            _shareRepository = shareRepository;
        }

        public async Task<Response<PostShareSummaryViewModel>> Handle(SharePostCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var post = await _postRepository.GetPublicPostByIdAsync(request.PostId);
            if (post == null)
                throw new ApiException("Post not found.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            var existingShare = await _shareRepository.GetByUserAndPostAsync(userId, request.PostId);
            if (existingShare == null)
            {
                await _shareRepository.AddAsync(new PostShare
                {
                    PostId = request.PostId,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                });
            }

            var updatedPost = await _postRepository.GetPublicPostByIdAsync(request.PostId);
            var viewModel = new PostShareSummaryViewModel
            {
                PostId = request.PostId,
                IsSharedByCurrentUser = true,
                ShareCount = updatedPost?.Shares?.Count ?? 0
            };

            return new Response<PostShareSummaryViewModel>(viewModel);
        }
    }
}
