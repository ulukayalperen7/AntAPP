using Ant.Application.Exceptions;
using Ant.Application.Filters;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Posts.Queries.GetPostReactions
{
    public class GetPostReactionsQuery : IRequest<PagedResponse<PostReactionViewModel>>
    {
        public Guid PostId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class PostReactionViewModel
    {
        public Guid ReactionId { get; set; }
        public Guid PostId { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class GetPostReactionsQueryHandler : IRequestHandler<GetPostReactionsQuery, PagedResponse<PostReactionViewModel>>
    {
        private readonly IPostRepositoryAsync _postRepository;
        private readonly IPostReactionRepositoryAsync _reactionRepository;

        public GetPostReactionsQueryHandler(
            IPostRepositoryAsync postRepository,
            IPostReactionRepositoryAsync reactionRepository)
        {
            _postRepository = postRepository;
            _reactionRepository = reactionRepository;
        }

        public async Task<PagedResponse<PostReactionViewModel>> Handle(GetPostReactionsQuery request, CancellationToken cancellationToken)
        {
            var validFilter = new RequestParameter(request.PageNumber, request.PageSize);

            var post = await _postRepository.GetPublicPostByIdAsync(request.PostId);
            if (post == null)
                throw new ApiException("Post not found.");

            var reactions = await _reactionRepository.GetPagedByPostAsync(request.PostId, validFilter.PageNumber, validFilter.PageSize);
            var totalRecords = await _reactionRepository.GetCountByPostAsync(request.PostId);

            var viewModel = reactions
                .Select(r => new PostReactionViewModel
                {
                    ReactionId = r.Id,
                    PostId = r.PostId,
                    UserId = r.UserId,
                    UserName = r.User?.UserName,
                    CreatedAt = r.CreatedAt
                })
                .ToList();

            return new PagedResponse<PostReactionViewModel>(viewModel, validFilter.PageNumber, validFilter.PageSize)
            {
                TotalRecords = totalRecords
            };
        }
    }
}
