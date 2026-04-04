using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Collections.Commands.UnsaveRoute
{
    public class UnsaveRouteCommand : IRequest<Guid>
    {
        public Guid RouteId { get; set; }
    }

    public class UnsaveRouteCommandHandler : IRequestHandler<UnsaveRouteCommand, Guid>
    {
        private readonly ICollectionRepositoryAsync _collectionRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public UnsaveRouteCommandHandler(ICollectionRepositoryAsync collectionRepository, IAuthenticatedUserService authenticatedUser)
        {
            _collectionRepository = collectionRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Guid> Handle(UnsaveRouteCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_authenticatedUser.UserId))
                throw new ApiException("Authentication required.");

            var userId = Guid.Parse(_authenticatedUser.UserId);
            var defaultCollection = await _collectionRepository.GetDefaultCollectionAsync(userId);
            if (defaultCollection == null)
                throw new ApiException("No saved routes collection found.");

            var collectionRoute = await _collectionRepository.GetCollectionRouteAsync(defaultCollection.Id, request.RouteId);
            if (collectionRoute == null)
                throw new ApiException("Route is not saved.");

            await _collectionRepository.RemoveCollectionRouteAsync(collectionRoute);
            return request.RouteId;
        }
    }
}
