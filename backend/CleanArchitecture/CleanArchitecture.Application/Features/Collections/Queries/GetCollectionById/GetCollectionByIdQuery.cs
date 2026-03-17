using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Collections.Queries.GetCollectionById
{
    public class GetCollectionByIdQuery : IRequest<CollectionDetailViewModel>
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
    }

    public class GetCollectionByIdQueryHandler : IRequestHandler<GetCollectionByIdQuery, CollectionDetailViewModel>
    {
        private readonly ICollectionRepositoryAsync _collectionRepository;

        public GetCollectionByIdQueryHandler(ICollectionRepositoryAsync collectionRepository)
        {
            _collectionRepository = collectionRepository;
        }

        public async Task<CollectionDetailViewModel> Handle(GetCollectionByIdQuery request, CancellationToken cancellationToken)
        {
            var collection = await _collectionRepository.GetCollectionWithRoutesAsync(request.Id);
            if (collection == null)
                throw new ApiException("Collection not found.");

            if (request.UserId.HasValue && collection.UserId != request.UserId.Value)
                throw new ApiException("Collection not found.");

            return new CollectionDetailViewModel
            {
                Id = collection.Id,
                UserId = collection.UserId,
                Name = collection.Name,
                IsDefault = collection.IsDefault,
                IsPublic = collection.IsPublic,
                Description = collection.Description,
                ThumbnailUrl = collection.ThumbnailUrl,
                Created = collection.CreatedAt,
                Routes = collection.CollectionRoutes?.Select(cr => new CollectionRouteItemViewModel
                {
                    RouteId = cr.RouteId,
                    Title = cr.Route?.Title,
                    ThumbnailUrl = cr.Route?.ThumbnailUrl,
                    SavedAt = cr.SavedAt
                }).ToList() ?? new List<CollectionRouteItemViewModel>()
            };
        }
    }
}
