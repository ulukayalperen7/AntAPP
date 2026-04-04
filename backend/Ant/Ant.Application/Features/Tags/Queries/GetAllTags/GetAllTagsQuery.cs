using AutoMapper;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System.Collections.Generic;
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
        private readonly IMapper _mapper;

        public GetAllTagsQueryHandler(ITagRepositoryAsync tagRepository, IMapper mapper)
        {
            _tagRepository = tagRepository;
            _mapper = mapper;
        }

        public async Task<PagedResponse<GetAllTagsViewModel>> Handle(GetAllTagsQuery request, CancellationToken cancellationToken)
        {
            var validFilter = _mapper.Map<GetAllTagsParameter>(request);
            var result = await _tagRepository.GetPagedReponseAsync(validFilter.PageNumber, validFilter.PageSize);
            var viewModels = _mapper.Map<List<GetAllTagsViewModel>>(result);
            return new PagedResponse<GetAllTagsViewModel>(viewModels, validFilter.PageNumber, validFilter.PageSize);
        }
    }
}
