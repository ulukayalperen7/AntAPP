using Ant.Application.DTOs;
using Ant.Application.Features.Routes.Commands.CreateRoute;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Core.Entities;
using Ant.Core.Enums;
using Moq;
using NetTopologySuite.Geometries;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.UnitTests.Features.Routes;

public class CreateRouteCommandTests
{
    private readonly Mock<IRouteRepositoryAsync> _routeRepoMock;
    private readonly Mock<ISpotRepositoryAsync> _spotRepoMock;
    private readonly Mock<IMapRoutingService> _mapRoutingMock;
    private readonly Mock<IAuthenticatedUserService> _authMock;
    private readonly Mock<IAppCacheService> _cacheMock;
    private readonly CreateRouteCommandHandler _handler;

    public CreateRouteCommandTests()
    {
        _routeRepoMock = new Mock<IRouteRepositoryAsync>();
        _spotRepoMock = new Mock<ISpotRepositoryAsync>();
        _mapRoutingMock = new Mock<IMapRoutingService>();
        _authMock = new Mock<IAuthenticatedUserService>();
        _cacheMock = new Mock<IAppCacheService>();
        _handler = new CreateRouteCommandHandler(
            _routeRepoMock.Object,
            _spotRepoMock.Object,
            _mapRoutingMock.Object,
            _authMock.Object,
            _cacheMock.Object);
    }

    [Fact]
    public async Task Handle_NewRoute_DefaultsContentTypeToCommunity()
    {
        var userId = Guid.NewGuid();
        var firstSpotId = Guid.NewGuid();
        var secondSpotId = Guid.NewGuid();

        _authMock.Setup(a => a.UserId).Returns(userId.ToString());
        _spotRepoMock.Setup(r => r.GetByIdAsync(firstSpotId)).ReturnsAsync(new Spot
        {
            Id = firstSpotId,
            Location = new Point(30.70, 36.88) { SRID = 4326 }
        });
        _spotRepoMock.Setup(r => r.GetByIdAsync(secondSpotId)).ReturnsAsync(new Spot
        {
            Id = secondSpotId,
            Location = new Point(30.72, 36.90) { SRID = 4326 }
        });
        _mapRoutingMock
            .Setup(r => r.GetRouteGeometryAsync(It.IsAny<List<Point>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RouteGeometryResult
            {
                EncodedPolyline = string.Empty,
                DistanceMeters = 1000,
                DurationSeconds = 900,
                CenterPoint = new Point(30.71, 36.89) { SRID = 4326 }
            });
        _routeRepoMock.Setup(r => r.AddAsync(It.IsAny<Route>())).ReturnsAsync((Route route) => route);

        await _handler.Handle(new CreateRouteCommand
        {
            Title = "Community route",
            IsPublic = true,
            Spots = new List<CreateRouteSpotRequest>
            {
                new() { SpotId = firstSpotId },
                new() { SpotId = secondSpotId }
            }
        }, CancellationToken.None);

        _routeRepoMock.Verify(r => r.AddAsync(It.Is<Route>(route =>
            route.ContentType == RouteContentTypeEnum.Community &&
            route.RouteType == RouteTypeEnum.Walking &&
            route.AuthorUserId == userId)), Times.Once);
    }
}
