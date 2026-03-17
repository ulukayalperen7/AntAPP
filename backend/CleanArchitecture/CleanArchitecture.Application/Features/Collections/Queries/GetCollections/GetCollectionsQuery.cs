using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Collections.Queries.GetCollections
{
    public class GetCollectionsQuery : IRequest<PagedResponse<CollectionViewModel>>
    {
        public Guid? UserId { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }

    public class GetCollectionsQueryHandler : IRequestHandler<GetCollectionsQuery, PagedResponse<CollectionViewModel>>
    {
        private readonly ICollectionRepositoryAsync _collectionRepository;

        public GetCollectionsQueryHandler(ICollectionRepositoryAsync collectionRepository)
        {
            _collectionRepository = collectionRepository;
        }

        public async Task<PagedResponse<CollectionViewModel>> Handle(GetCollectionsQuery request, CancellationToken cancellationToken)
        {
            IReadOnlyList<Collection> collections;

            if (request.UserId.HasValue)
            {
                collections = await _collectionRepository.GetCollectionsByUserIdAsync(
                    request.UserId.Value, request.PageNumber, request.PageSize);
            }
            else
            {
                collections = await _collectionRepository.GetAllCollectionsPagedAsync(
                    request.PageNumber, request.PageSize);
            }

            var viewModels = collections.Select(c => new CollectionViewModel
            {
                Id = c.Id,
                UserId = c.UserId,
                Name = c.Name,
                IsDefault = c.IsDefault,
                IsPublic = c.IsPublic,
                Description = c.Description,
                ThumbnailUrl = c.ThumbnailUrl,
                RouteCount = c.CollectionRoutes?.Count ?? 0,
                Created = c.Created
            }).ToList();

            return new PagedResponse<CollectionViewModel>(viewModels, request.PageNumber, request.PageSize);
        }
    }
}
