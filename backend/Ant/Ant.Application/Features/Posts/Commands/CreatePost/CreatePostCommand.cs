using Ant.Application.Exceptions;
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

namespace Ant.Application.Features.Posts.Commands.CreatePost
{
    public class CreatePostCommand : IRequest<Response<Guid>>
    {
        public Guid RouteId { get; set; }
        public string Content { get; set; }
        public bool IsPublic { get; set; } = true;
        public List<string> ImageUrls { get; set; }
    }

    public class CreatePostCommandHandler : IRequestHandler<CreatePostCommand, Response<Guid>>
    {
        private readonly IGenericRepositoryAsync<Post> _postRepository;
        private readonly IRouteRepositoryAsync _routeRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public CreatePostCommandHandler(
            IGenericRepositoryAsync<Post> postRepository,
            IRouteRepositoryAsync routeRepository,
            IAuthenticatedUserService authenticatedUser)
        {
            _postRepository = postRepository;
            _routeRepository = routeRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Response<Guid>> Handle(CreatePostCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            if (request.RouteId == Guid.Empty)
                throw new ApiException("Route is required.");

            var route = await _routeRepository.GetByIdAsync(request.RouteId);
            if (route == null || route.IsDeleted)
                throw new ApiException("Route not found.");

            if (!route.IsPublic)
                throw new ApiException("Only public routes can be shared as posts.");

            var authorUserId = Guid.Parse(_authenticatedUser.UserId);

            var normalizedImageUrls = (request.ImageUrls ?? new List<string>())
                .Where(url => !string.IsNullOrWhiteSpace(url))
                .Select(url => url.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(8)
                .ToList();

            var normalizedContent = request.Content?.Trim();
            if (string.IsNullOrWhiteSpace(normalizedContent) && normalizedImageUrls.Count == 0)
                throw new ApiException("Post text or at least one image is required.");

            var post = new Post
            {
                AuthorUserId = authorUserId,
                RouteId = request.RouteId,
                Content = normalizedContent,
                IsPublic = request.IsPublic,
                IsDeleted = false,
                Images = normalizedImageUrls
                    .Select((url, index) => new PostImage
                    {
                        ImageUrl = url,
                        SortOrder = index + 1
                    })
                    .ToList()
            };

            await _postRepository.AddAsync(post);
            return new Response<Guid>(post.Id, message: "Post created.");
        }
    }
}
