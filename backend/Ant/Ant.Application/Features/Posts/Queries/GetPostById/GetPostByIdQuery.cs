using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using Ant.Application.Features.Posts.Queries.GetFeedPosts;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Posts.Queries.GetPostById
{
    public class GetPostByIdQuery : IRequest<Response<FeedPostViewModel>>
    {
        public Guid PostId { get; set; }
    }

    public class GetPostByIdQueryHandler : IRequestHandler<GetPostByIdQuery, Response<FeedPostViewModel>>
    {
        private readonly IPostRepositoryAsync _postRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public GetPostByIdQueryHandler(IPostRepositoryAsync postRepository, IAuthenticatedUserService authenticatedUser)
        {
            _postRepository = postRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Response<FeedPostViewModel>> Handle(GetPostByIdQuery request, CancellationToken cancellationToken)
        {
            Guid? currentUserId = null;
            if (!string.IsNullOrEmpty(_authenticatedUser.UserId) && Guid.TryParse(_authenticatedUser.UserId, out var parsedUserId))
            {
                currentUserId = parsedUserId;
            }

            var post = await _postRepository.GetPublicPostByIdAsync(request.PostId);
            if (post == null)
                throw new ApiException("Post not found.");

            var viewModel = new FeedPostViewModel
            {
                PostId = post.Id,
                Content = post.Content,
                CreatedAt = post.CreatedAt,
                IsPublic = post.IsPublic,
                AuthorUserId = post.AuthorUserId,
                AuthorUserName = post.AuthorUser?.UserName,
                RouteId = post.RouteId,
                RouteTitle = post.Route?.Title,
                RouteDescription = post.Route?.Description,
                RouteThumbnailUrl = post.Route?.ThumbnailUrl,
                RouteContentType = post.Route?.ContentType.ToString(),
                RouteIsPublic = post.Route?.IsPublic ?? false,
                RouteAverageRating = post.Route == null || post.Route.RatingCount == 0
                    ? 0
                    : Math.Round(post.Route.RatingSum / (double)post.Route.RatingCount, 1),
                ImageUrls = post.Images?
                    .OrderBy(image => image.SortOrder)
                    .Select(image => image.ImageUrl)
                    .ToList() ?? new System.Collections.Generic.List<string>(),
                ReactionCount = post.Reactions?.Count ?? 0,
                CommentCount = post.Comments?.Count(c => !c.IsDeleted) ?? 0,
                ShareCount = post.Shares?.Count ?? 0,
                IsReactedByCurrentUser = currentUserId.HasValue && (post.Reactions?.Any(r => r.UserId == currentUserId.Value) ?? false),
                IsSharedByCurrentUser = currentUserId.HasValue && (post.Shares?.Any(s => s.UserId == currentUserId.Value) ?? false)
            };

            return new Response<FeedPostViewModel>(viewModel);
        }
    }
}
