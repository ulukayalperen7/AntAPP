using Ant.Application.Features.Spots.Queries.GetAdminSpots;
using Ant.Application.Interfaces.Repositories;
using Ant.Core.Entities;
using Moq;
using NetTopologySuite.Geometries;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.UnitTests.Features.Spots;

public class GetAdminSpotsQueryTests
{
    private readonly Mock<ISpotRepositoryAsync> _spotRepoMock;
    private readonly GetAdminSpotsQueryHandler _handler;

    public GetAdminSpotsQueryTests()
    {
        _spotRepoMock = new Mock<ISpotRepositoryAsync>();
        _handler = new GetAdminSpotsQueryHandler(_spotRepoMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsInactiveBusinessSpots()
    {
        var activeSpotId = Guid.NewGuid();
        var inactiveSpotId = Guid.NewGuid();

        _spotRepoMock
            .Setup(r => r.GetAdminPagedSpotsAsync(1, 10, null))
            .ReturnsAsync(new List<Spot>
            {
                new()
                {
                    Id = activeSpotId,
                    Name = "Active spot",
                    Description = "Visible publicly",
                    IsActive = true,
                    Location = new Point(30.70, 36.88) { SRID = 4326 },
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = inactiveSpotId,
                    Name = "Business pending spot",
                    Description = "Needs approval",
                    IsActive = false,
                    Location = new Point(30.71, 36.89) { SRID = 4326 },
                    CreatedAt = DateTime.UtcNow
                }
            });

        _spotRepoMock
            .Setup(r => r.GetAdminSpotsCountAsync(null))
            .ReturnsAsync(2);

        var response = await _handler.Handle(new GetAdminSpotsQuery
        {
            PageNumber = 1,
            PageSize = 10
        }, CancellationToken.None);

        Assert.Equal(2, response.Data.Count);
        Assert.Contains(response.Data, s => s.Id == inactiveSpotId && !s.IsActive);
        Assert.Equal(2, response.TotalRecords);
        _spotRepoMock.Verify(r => r.GetPagedSpotsAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>()), Times.Never);
    }
}
