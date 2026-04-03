using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Spots.Commands.DeleteSpot
{
    public class DeleteSpotCommand : IRequest<Response<Guid>>
    {
        public Guid Id { get; set; }
        public Guid? EnforcedOwnerUserId { get; set; }
    }

    public class DeleteSpotCommandHandler : IRequestHandler<DeleteSpotCommand, Response<Guid>>
    {
        private readonly ISpotRepositoryAsync _spotRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public DeleteSpotCommandHandler(ISpotRepositoryAsync spotRepository, IAuthenticatedUserService authenticatedUser)
        {
            _spotRepository = spotRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Response<Guid>> Handle(DeleteSpotCommand request, CancellationToken cancellationToken)
        {
            var spot = await _spotRepository.GetSpotWithTrackingAsync(request.Id);
            if (spot == null)
                throw new ApiException("Spot not found.");

            if (request.EnforcedOwnerUserId.HasValue && spot.OwnerUserId != request.EnforcedOwnerUserId.Value)
                throw new ApiException("You can only delete your own spots.");

            spot.IsActive = false;
            await _spotRepository.UpdateAsync(spot);
            return new Response<Guid>(spot.Id, message: "Spot deleted.");
        }
    }
}
