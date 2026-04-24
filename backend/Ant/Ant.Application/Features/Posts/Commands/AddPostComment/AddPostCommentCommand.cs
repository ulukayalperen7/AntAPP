using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using Ant.Core.Entities;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Posts.Commands.AddPostComment
{
    public class AddPostCommentCommand : IRequest<Response<PostCommentCreateViewModel>>
    {
        public Guid PostId { get; set; }
        public string Content { get; set; }
    }

    public class PostCommentCreateViewModel
    {
        public Guid CommentId { get; set; }
        public Guid PostId { get; set; }
        public int CommentCount { get; set; }
    }

    public class AddPostCommentCommandHandler : IRequestHandler<AddPostCommentCommand, Response<PostCommentCreateViewModel>>
    {
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IPostRepositoryAsync _postRepository;
        private readonly IPostCommentRepositoryAsync _commentRepository;

        public AddPostCommentCommandHandler(
            IAuthenticatedUserService authenticatedUser,
            IPostRepositoryAsync postRepository,
            IPostCommentRepositoryAsync commentRepository)
        {
            _authenticatedUser = authenticatedUser;
            _postRepository = postRepository;
            _commentRepository = commentRepository;
        }

        public async Task<Response<PostCommentCreateViewModel>> Handle(AddPostCommentCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var content = request.Content?.Trim();
            if (string.IsNullOrWhiteSpace(content))
                throw new ApiException("Comment content is required.");
            if (content.Length > 600)
                throw new ApiException("Comment content is too long.");

            var post = await _postRepository.GetPublicPostByIdAsync(request.PostId);
            if (post == null)
                throw new ApiException("Post not found.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            var comment = new PostComment
            {
                PostId = request.PostId,
                UserId = userId,
                Content = content,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            await _commentRepository.AddAsync(comment);

            var commentCount = await _commentRepository.GetCountByPostAsync(request.PostId);
            var viewModel = new PostCommentCreateViewModel
            {
                CommentId = comment.Id,
                PostId = request.PostId,
                CommentCount = commentCount
            };

            return new Response<PostCommentCreateViewModel>(viewModel);
        }
    }
}
