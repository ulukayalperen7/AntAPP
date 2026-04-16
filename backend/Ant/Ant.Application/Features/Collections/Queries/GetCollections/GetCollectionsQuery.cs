using Ant.Core.Entities;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Collections.Queries.GetCollections
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
            int totalRecords;

            if (request.UserId.HasValue)
            {
                collections = await _collectionRepository.GetCollectionsByUserIdAsync(
                    request.UserId.Value, request.PageNumber, request.PageSize);
                totalRecords = await _collectionRepository.GetCountByUserIdAsync(request.UserId.Value);
            }
            else
            {
                collections = await _collectionRepository.GetAllCollectionsPagedAsync(
                    request.PageNumber, request.PageSize);
                totalRecords = await _collectionRepository.GetCountAsync();
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
                CreatedAt = c.CreatedAt
            }).ToList();

            var response = new PagedResponse<CollectionViewModel>(viewModels, request.PageNumber, request.PageSize);
            response.TotalRecords = totalRecords;
            response.TotalPages = (int)Math.Ceiling((double)totalRecords / request.PageSize);
            return response;
        }
    }
}
