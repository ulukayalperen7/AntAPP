using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
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
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public Guid? EnforcedOwnerUserId { get; set; }
    }

    public class UpdateSpotCommandHandler : IRequestHandler<UpdateSpotCommand, Response<Guid>>
    {
        private readonly ISpotRepositoryAsync _spotRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public UpdateSpotCommandHandler(ISpotRepositoryAsync spotRepository, IAuthenticatedUserService authenticatedUser)
        {
            _spotRepository = spotRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Response<Guid>> Handle(UpdateSpotCommand request, CancellationToken cancellationToken)
        {
            var spot = await _spotRepository.GetSpotWithTrackingAsync(request.Id);
            if (spot == null)
                throw new ApiException("Spot not found.");

            if (request.EnforcedOwnerUserId.HasValue && spot.OwnerUserId != request.EnforcedOwnerUserId.Value)
                throw new ApiException("You can only update your own spots.");

            if (request.Name != null) spot.Name = request.Name;
            if (request.Description != null) spot.Description = request.Description;
            if (request.PhotoUrl != null) spot.PhotoUrl = request.PhotoUrl;
            if (request.Latitude.HasValue && request.Longitude.HasValue)
                spot.Location = new Point(request.Longitude.Value, request.Latitude.Value) { SRID = 4326 };

            await _spotRepository.UpdateAsync(spot);
            return new Response<Guid>(spot.Id, message: "Spot updated.");
        }
    }
}
