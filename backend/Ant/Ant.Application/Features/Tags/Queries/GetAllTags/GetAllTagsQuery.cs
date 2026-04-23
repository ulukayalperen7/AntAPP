using Ant.Application.Common.Caching;
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

namespace Ant.Application.Features.Tags.Queries.GetAllTags
{
    /// <summary>
    /// Query to fetch all tags from the database with pagination.
    /// Used by the GET /api/v1/Tag endpoint.
    /// </summary>
    public class GetAllTagsQuery : IRequest<PagedResponse<GetAllTagsViewModel>>
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }

    public class GetAllTagsQueryHandler : IRequestHandler<GetAllTagsQuery, PagedResponse<GetAllTagsViewModel>>
    {
        private readonly ITagRepositoryAsync _tagRepository;
        private readonly IAppCacheService _cache;

        public GetAllTagsQueryHandler(ITagRepositoryAsync tagRepository, IAppCacheService cache)
        {
            _tagRepository = tagRepository;
            _cache = cache;
        }

        public async Task<PagedResponse<GetAllTagsViewModel>> Handle(GetAllTagsQuery request, CancellationToken cancellationToken)
        {
            var validFilter = new GetAllTagsParameter
            {
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return await _cache.GetOrCreateAsync(
                AppCacheKeys.TagList(validFilter.PageNumber, validFilter.PageSize),
                async _ =>
                {
                    var result = await _tagRepository.GetPagedReponseAsync(validFilter.PageNumber, validFilter.PageSize);
                    var viewModels = result.Select(MapToViewModel).ToList();
                    return new PagedResponse<GetAllTagsViewModel>(viewModels, validFilter.PageNumber, validFilter.PageSize);
                },
                TimeSpan.FromMinutes(15),
                cancellationToken);
        }

        private static GetAllTagsViewModel MapToViewModel(Tag tag)
        {
            return new GetAllTagsViewModel
            {
                Id = tag.Id,
                Name = tag.Name,
                Description = tag.Description,
                IsActive = tag.IsActive
            };
        }
    }
}
