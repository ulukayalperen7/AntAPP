using Ant.Application.Exceptions;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Collections.Queries.GetCollectionById
{
    public class GetCollectionByIdQuery : IRequest<Response<CollectionDetailViewModel>>
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
    }

    public class GetCollectionByIdQueryHandler : IRequestHandler<GetCollectionByIdQuery, Response<CollectionDetailViewModel>>
    {
        private readonly ICollectionRepositoryAsync _collectionRepository;

        public GetCollectionByIdQueryHandler(ICollectionRepositoryAsync collectionRepository)
        {
            _collectionRepository = collectionRepository;
        }

        public async Task<Response<CollectionDetailViewModel>> Handle(GetCollectionByIdQuery request, CancellationToken cancellationToken)
        {
            var collection = await _collectionRepository.GetCollectionWithRoutesAsync(request.Id);
            if (collection == null)
                throw new ApiException("Collection not found.");

            if (request.UserId.HasValue && collection.UserId != request.UserId.Value)
                throw new ApiException("Collection not found.");

            return new Response<CollectionDetailViewModel>(new CollectionDetailViewModel
            {
                Id = collection.Id,
                UserId = collection.UserId,
                Name = collection.Name,
                IsDefault = collection.IsDefault,
                IsPublic = collection.IsPublic,
                Description = collection.Description,
                ThumbnailUrl = collection.ThumbnailUrl,
                CreatedAt = collection.CreatedAt,
                Routes = collection.CollectionRoutes?.Select(cr => new CollectionRouteItemViewModel
                {
                    Id = cr.RouteId,
                    Title = cr.Route?.Title,
                    ThumbnailUrl = cr.Route?.ThumbnailUrl,
                    SavedAt = cr.SavedAt
                }).ToList() ?? new List<CollectionRouteItemViewModel>()
            });
        }
    }
}
