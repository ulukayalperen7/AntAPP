using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using Ant.Core.Entities;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Posts.Commands.TogglePostReaction
{
    public class TogglePostReactionCommand : IRequest<Response<PostReactionSummaryViewModel>>
    {
        public Guid PostId { get; set; }
    }

    public class PostReactionSummaryViewModel
    {
        public Guid PostId { get; set; }
        public bool IsReactedByCurrentUser { get; set; }
        public int ReactionCount { get; set; }
    }

    public class TogglePostReactionCommandHandler : IRequestHandler<TogglePostReactionCommand, Response<PostReactionSummaryViewModel>>
    {
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IPostRepositoryAsync _postRepository;
        private readonly IPostReactionRepositoryAsync _reactionRepository;

        public TogglePostReactionCommandHandler(
            IAuthenticatedUserService authenticatedUser,
            IPostRepositoryAsync postRepository,
            IPostReactionRepositoryAsync reactionRepository)
        {
            _authenticatedUser = authenticatedUser;
            _postRepository = postRepository;
            _reactionRepository = reactionRepository;
        }

        public async Task<Response<PostReactionSummaryViewModel>> Handle(TogglePostReactionCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var post = await _postRepository.GetPublicPostByIdAsync(request.PostId);
            if (post == null)
                throw new ApiException("Post not found.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            var existingReaction = await _reactionRepository.GetByUserAndPostAsync(userId, request.PostId);

            var reacted = existingReaction == null;
            if (existingReaction == null)
            {
                await _reactionRepository.AddAsync(new PostReaction
                {
                    PostId = request.PostId,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                });
            }
            else
            {
                await _reactionRepository.DeleteAsync(existingReaction);
            }

            var updatedPost = await _postRepository.GetPublicPostByIdAsync(request.PostId);
            var viewModel = new PostReactionSummaryViewModel
            {
                PostId = request.PostId,
                IsReactedByCurrentUser = reacted,
                ReactionCount = updatedPost?.Reactions?.Count ?? 0
            };

            return new Response<PostReactionSummaryViewModel>(viewModel);
        }
    }
}
