using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using Ant.Core.Enums;
using Ant.Application.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Posts.Queries.GetFeedPosts
{
    public class GetFeedPostsQuery : IRequest<PagedResponse<FeedPostViewModel>>
    {
        public string Mode { get; set; } = "timeline";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public Guid? AuthorId { get; set; }
    }

    public class FeedPostViewModel
    {
        public Guid PostId { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsPublic { get; set; }

        public Guid AuthorUserId { get; set; }
        public string AuthorUserName { get; set; }
        public string AuthorProfilePhotoUrl { get; set; }

        public Guid RouteId { get; set; }
        public string RouteTitle { get; set; }
        public string RouteDescription { get; set; }
        public string RouteThumbnailUrl { get; set; }
        public string RouteContentType { get; set; }
        public bool RouteIsPublic { get; set; }
        public double RouteAverageRating { get; set; }

        public List<string> ImageUrls { get; set; }
        public int ReactionCount { get; set; }
        public int CommentCount { get; set; }
        public int ShareCount { get; set; }
        public bool IsReactedByCurrentUser { get; set; }
        public bool IsSharedByCurrentUser { get; set; }
    }

    public class GetFeedPostsQueryHandler : IRequestHandler<GetFeedPostsQuery, PagedResponse<FeedPostViewModel>>
    {
        private readonly IPostRepositoryAsync _postRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public GetFeedPostsQueryHandler(IPostRepositoryAsync postRepository, IAuthenticatedUserService authenticatedUser)
        {
            _postRepository = postRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<PagedResponse<FeedPostViewModel>> Handle(GetFeedPostsQuery request, CancellationToken cancellationToken)
        {
            var validFilter = new Ant.Application.Filters.RequestParameter(request.PageNumber, request.PageSize);
            Guid? currentUserId = null;
            if (!string.IsNullOrEmpty(_authenticatedUser.UserId) && Guid.TryParse(_authenticatedUser.UserId, out var parsedUserId))
            {
                currentUserId = parsedUserId;
            }

            RouteContentTypeEnum? contentType = request.Mode?.ToLowerInvariant() switch
            {
                "official" => RouteContentTypeEnum.Official,
                "community" => RouteContentTypeEnum.Community,
                _ => null
            };

            var posts = await _postRepository.GetFeedPostsAsync(contentType, validFilter.PageNumber, validFilter.PageSize, request.AuthorId);
            var totalRecords = await _postRepository.GetFeedPostsCountAsync(contentType, request.AuthorId);

            var viewModel = posts.Select(post => new FeedPostViewModel
            {
                PostId = post.Id,
                Content = post.Content,
                CreatedAt = post.CreatedAt,
                IsPublic = post.IsPublic,
                AuthorUserId = post.AuthorUserId,
                AuthorUserName = post.AuthorUser?.UserName,
                AuthorProfilePhotoUrl = post.AuthorUser?.ProfilePhotoUrl,
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
                    .ToList() ?? new List<string>(),
                ReactionCount = post.Reactions?.Count ?? 0,
                CommentCount = post.Comments?.Count(c => !c.IsDeleted) ?? 0,
                ShareCount = post.Shares?.Count ?? 0,
                IsReactedByCurrentUser = currentUserId.HasValue && (post.Reactions?.Any(r => r.UserId == currentUserId.Value) ?? false),
                IsSharedByCurrentUser = currentUserId.HasValue && (post.Shares?.Any(s => s.UserId == currentUserId.Value) ?? false)
            }).ToList();

            return new PagedResponse<FeedPostViewModel>(viewModel, validFilter.PageNumber, validFilter.PageSize)
            {
                TotalRecords = totalRecords
            };
        }
    }
}
