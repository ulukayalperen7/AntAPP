using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Posts.Commands.UpdatePostComment
{
    public class UpdatePostCommentCommand : IRequest<Response<Guid>>
    {
        public Guid PostId { get; set; }
        public Guid CommentId { get; set; }
        public string Content { get; set; }
    }

    public class UpdatePostCommentCommandHandler : IRequestHandler<UpdatePostCommentCommand, Response<Guid>>
    {
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IPostCommentRepositoryAsync _commentRepository;

        public UpdatePostCommentCommandHandler(
            IAuthenticatedUserService authenticatedUser,
            IPostCommentRepositoryAsync commentRepository)
        {
            _authenticatedUser = authenticatedUser;
            _commentRepository = commentRepository;
        }

        public async Task<Response<Guid>> Handle(UpdatePostCommentCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var content = request.Content?.Trim();
            if (string.IsNullOrWhiteSpace(content))
                throw new ApiException("Comment content is required.");
            if (content.Length > 600)
                throw new ApiException("Comment content is too long.");

            var comment = await _commentRepository.GetByIdAsync(request.CommentId);
            if (comment == null || comment.PostId != request.PostId || comment.IsDeleted)
                throw new ApiException("Comment not found.");

            if (comment.UserId.ToString() != _authenticatedUser.UserId)
                throw new ApiException("You are not authorized to edit this comment.");

            comment.Content = content;
            await _commentRepository.UpdateAsync(comment);

            return new Response<Guid>(comment.Id);
        }
    }
}
