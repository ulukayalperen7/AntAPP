using Ant.Application.Common.Caching;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using Ant.Core.Entities;
using MediatR;
using NetTopologySuite.Geometries;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Spots.Commands.CreateSpot
{
    public class CreateSpotCommand : IRequest<Response<Guid>>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string PhotoUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string GooglePlaceId { get; set; }
        public bool IsActive { get; set; }
        public Guid? OwnerUserId { get; set; }
    }

    public class CreateSpotCommandHandler : IRequestHandler<CreateSpotCommand, Response<Guid>>
    {
        private readonly ISpotRepositoryAsync _spotRepository;
        private readonly IAppCacheService _cache;

        public CreateSpotCommandHandler(ISpotRepositoryAsync spotRepository, IAppCacheService cache)
        {
            _spotRepository = spotRepository;
            _cache = cache;
        }

        public async Task<Response<Guid>> Handle(CreateSpotCommand request, CancellationToken cancellationToken)
        {
            var spot = new Spot
            {
                Name = request.Name,
                Description = request.Description,
                PhotoUrl = request.PhotoUrl,
                Location = new Point(request.Longitude, request.Latitude) { SRID = 4326 },
                GooglePlaceId = request.GooglePlaceId,
                IsActive = request.IsActive,
                OwnerUserId = request.OwnerUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _spotRepository.AddAsync(spot);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.SpotsPrefix, cancellationToken);

            return new Response<Guid>(spot.Id, "Spot has been successfully created.");
        }
    }
}
