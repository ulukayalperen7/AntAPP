using Ant.Application.Exceptions;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using NetTopologySuite.Geometries;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Spots.Commands.UpdateSpot
{
    public class UpdateSpotCommand : IRequest<Response<Guid>>
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string PhotoUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string GooglePlaceId { get; set; }
        public bool IsActive { get; set; }
    }

    public class UpdateSpotCommandHandler : IRequestHandler<UpdateSpotCommand, Response<Guid>>
    {
        private readonly ISpotRepositoryAsync _spotRepository;

        public UpdateSpotCommandHandler(ISpotRepositoryAsync spotRepository)
        {
            _spotRepository = spotRepository;
        }

        public async Task<Response<Guid>> Handle(UpdateSpotCommand request, CancellationToken cancellationToken)
        {
            var spot = await _spotRepository.GetByIdAsync(request.Id);

            if (spot == null)
            {
                throw new ApiException($"Spot Not Found.");
            }

            spot.Name = request.Name;
            spot.Description = request.Description;
            spot.PhotoUrl = request.PhotoUrl;
            spot.Location = new Point(request.Longitude, request.Latitude) { SRID = 4326 };
            spot.GooglePlaceId = request.GooglePlaceId;
            spot.IsActive = request.IsActive;
            spot.UpdatedAt = DateTime.UtcNow;

            await _spotRepository.UpdateAsync(spot);

            return new Response<Guid>(spot.Id, "Spot has been successfully updated.");
        }
    }
}
