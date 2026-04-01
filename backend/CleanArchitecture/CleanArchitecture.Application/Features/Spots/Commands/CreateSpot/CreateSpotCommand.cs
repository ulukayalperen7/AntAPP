using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using NetTopologySuite.Geometries;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Spots.Commands.CreateSpot
{
    /// <summary>
    /// Command to create a new standalone point of interest (Spot).
    /// Used when a user drops a logical pin on the map.
    /// </summary>
    public class CreateSpotCommand : IRequest<Response<Guid>>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string PhotoUrl { get; set; }
        
        /// <summary>
        /// Latitude of the spot (Y Axis)
        /// </summary>
        public double Latitude { get; set; }
        
        /// <summary>
        /// Longitude of the spot (X Axis)
        /// </summary>
        public double Longitude { get; set; }
    }

    public class CreateSpotCommandHandler : IRequestHandler<CreateSpotCommand, Response<Guid>>
    {
        private readonly ISpotRepositoryAsync _spotRepository;

        public CreateSpotCommandHandler(ISpotRepositoryAsync spotRepository)
        {
            _spotRepository = spotRepository;
        }

        public async Task<Response<Guid>> Handle(CreateSpotCommand request, CancellationToken cancellationToken)
        {
            // Note: NTS uses Longitude (X), Latitude (Y) format for Points. Provide SRID 4326 for standard GPS coords.
            var locationPoint = new Point(request.Longitude, request.Latitude) { SRID = 4326 };

            var spot = new Spot
            {
                Name = request.Name,
                Description = request.Description,
                PhotoUrl = request.PhotoUrl,
                Location = locationPoint,
                IsActive = true,
                RatingSum = 0,
                RatingCount = 0
            };

            await _spotRepository.AddAsync(spot);
            
            return new Response<Guid>(spot.Id, message: "Spot created successfully");
        }
    }
}
