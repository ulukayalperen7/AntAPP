using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Posts.Commands.DeletePostComment
{
    public class DeletePostCommentCommand : IRequest<Response<Guid>>
    {
        public Guid PostId { get; set; }
        public Guid CommentId { get; set; }
    }

    public class DeletePostCommentCommandHandler : IRequestHandler<DeletePostCommentCommand, Response<Guid>>
    {
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IPostCommentRepositoryAsync _commentRepository;

        public DeletePostCommentCommandHandler(
            IAuthenticatedUserService authenticatedUser,
            IPostCommentRepositoryAsync commentRepository)
        {
            _authenticatedUser = authenticatedUser;
            _commentRepository = commentRepository;
        }

        public async Task<Response<Guid>> Handle(DeletePostCommentCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var comment = await _commentRepository.GetByIdAsync(request.CommentId);
            if (comment == null || comment.PostId != request.PostId || comment.IsDeleted)
                throw new ApiException("Comment not found.");

            if (comment.UserId.ToString() != _authenticatedUser.UserId)
                throw new ApiException("You are not authorized to delete this comment.");

            comment.IsDeleted = true;
            await _commentRepository.UpdateAsync(comment);

            return new Response<Guid>(comment.Id);
        }
    }
}
