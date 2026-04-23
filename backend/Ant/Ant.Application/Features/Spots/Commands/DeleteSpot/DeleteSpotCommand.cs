using Ant.Application.Common.Caching;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Spots.Commands.DeleteSpot
{
    public class DeleteSpotCommand : IRequest<Response<Guid>>
    {
        public Guid Id { get; set; }
        public Guid? EnforcedOwnerUserId { get; set; }

        public DeleteSpotCommand()
        {
        }

        public DeleteSpotCommand(Guid id)
        {
            Id = id;
        }
    }

    public class DeleteSpotCommandHandler : IRequestHandler<DeleteSpotCommand, Response<Guid>>
    {
        private readonly ISpotRepositoryAsync _spotRepository;
        private readonly IAppCacheService _cache;

        public DeleteSpotCommandHandler(ISpotRepositoryAsync spotRepository, IAppCacheService cache)
        {
            _spotRepository = spotRepository;
            _cache = cache;
        }

        public async Task<Response<Guid>> Handle(DeleteSpotCommand request, CancellationToken cancellationToken)
        {
            var spot = await _spotRepository.GetByIdAsync(request.Id);
            
            if (spot == null) throw new ApiException($"Spot Not Found.");

            if (request.EnforcedOwnerUserId.HasValue && spot.OwnerUserId != request.EnforcedOwnerUserId.Value)
            {
                throw new ApiException($"Unauthorized Spot Access.");
            }

            await _spotRepository.DeleteAsync(spot);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.SpotsPrefix, cancellationToken);
            await _cache.RemoveByPrefixAsync(AppCacheKeys.RoutesPrefix, cancellationToken);

            return new Response<Guid>(spot.Id, "Spot has been successfully deleted.");
        }
    }
}
