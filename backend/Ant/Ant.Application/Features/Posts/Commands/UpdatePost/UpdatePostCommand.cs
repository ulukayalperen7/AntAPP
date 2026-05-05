using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Posts.Commands.UpdatePost
{
    public class UpdatePostCommand : IRequest<Response<Guid>>
    {
        public Guid PostId { get; set; }
        public string Content { get; set; }
        public List<string> ImageUrls { get; set; }
    }

    public class UpdatePostCommandHandler : IRequestHandler<UpdatePostCommand, Response<Guid>>
    {
        private readonly IPostRepositoryAsync _postRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public UpdatePostCommandHandler(IPostRepositoryAsync postRepository, IAuthenticatedUserService authenticatedUser)
        {
            _postRepository = postRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Response<Guid>> Handle(UpdatePostCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var post = await _postRepository.GetPostForUpdateAsync(request.PostId);

            if (post == null)
                throw new ApiException("Post not found.");

            if (post.AuthorUserId.ToString() != _authenticatedUser.UserId)
                throw new ApiException("Not authorized.");

            var normalizedImageUrls = (request.ImageUrls ?? new List<string>())
                .Where(url => !string.IsNullOrWhiteSpace(url))
                .Select(url => url.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(8)
                .ToList();

            var normalizedContent = request.Content?.Trim();
            if (string.IsNullOrWhiteSpace(normalizedContent) && normalizedImageUrls.Count == 0)
                throw new ApiException("Post text or at least one image is required.");

            post.Content = normalizedContent;
            post.UpdatedAt = DateTime.UtcNow;

            await _postRepository.ReplacePostImagesAsync(post, normalizedImageUrls);

            return new Response<Guid>(post.Id, message: "Post updated.");
        }
    }
}
