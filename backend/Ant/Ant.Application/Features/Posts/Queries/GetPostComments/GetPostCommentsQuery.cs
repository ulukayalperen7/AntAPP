using Ant.Application.Exceptions;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Posts.Queries.GetPostComments
{
    public class GetPostCommentsQuery : IRequest<PagedResponse<PostCommentViewModel>>
    {
        public Guid PostId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class PostCommentViewModel
    {
        public Guid CommentId { get; set; }
        public Guid PostId { get; set; }
        public Guid? ParentCommentId { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class GetPostCommentsQueryHandler : IRequestHandler<GetPostCommentsQuery, PagedResponse<PostCommentViewModel>>
    {
        private readonly IPostRepositoryAsync _postRepository;
        private readonly IPostCommentRepositoryAsync _commentRepository;

        public GetPostCommentsQueryHandler(
            IPostRepositoryAsync postRepository,
            IPostCommentRepositoryAsync commentRepository)
        {
            _postRepository = postRepository;
            _commentRepository = commentRepository;
        }

        public async Task<PagedResponse<PostCommentViewModel>> Handle(GetPostCommentsQuery request, CancellationToken cancellationToken)
        {
            var validFilter = new Ant.Application.Filters.RequestParameter(request.PageNumber, request.PageSize);

            var post = await _postRepository.GetPublicPostByIdAsync(request.PostId);
            if (post == null)
                throw new ApiException("Post not found.");

            var comments = await _commentRepository.GetPagedByPostAsync(request.PostId, validFilter.PageNumber, validFilter.PageSize);
            var totalRecords = await _commentRepository.GetCountByPostAsync(request.PostId);

            var viewModel = comments
                .Select(c => new PostCommentViewModel
                {
                    CommentId = c.Id,
                    PostId = c.PostId,
                    ParentCommentId = c.ParentCommentId,
                    UserId = c.UserId,
                    UserName = c.User?.UserName,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
                })
                .ToList();

            return new PagedResponse<PostCommentViewModel>(viewModel, validFilter.PageNumber, validFilter.PageSize)
            {
                TotalRecords = totalRecords
            };
        }
    }
}
