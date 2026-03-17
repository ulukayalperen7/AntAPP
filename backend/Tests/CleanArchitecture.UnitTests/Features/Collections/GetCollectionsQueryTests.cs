using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Features.Collections.Queries.GetCollections;
using CleanArchitecture.Core.Interfaces.Repositories;
using Moq;

namespace CleanArchitecture.UnitTests.Features.Collections;

public class GetCollectionsQueryTests
{
    private readonly Mock<ICollectionRepositoryAsync> _repoMock;
    private readonly GetCollectionsQueryHandler _handler;

    public GetCollectionsQueryTests()
    {
        _repoMock = new Mock<ICollectionRepositoryAsync>();
        _handler = new GetCollectionsQueryHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_WithUserId_ReturnsUserCollections()
    {
        var userId = Guid.NewGuid();
        var collections = new List<Collection>
        {
            new() { Id = Guid.NewGuid(), UserId = userId, Name = "Favs", CollectionRoutes = new List<CollectionRoute> { new(), new() } },
            new() { Id = Guid.NewGuid(), UserId = userId, Name = "Weekend", CollectionRoutes = new List<CollectionRoute>() }
        };

        _repoMock.Setup(r => r.GetCollectionsByUserIdAsync(userId, 1, 10))
            .ReturnsAsync(collections);

        var result = await _handler.Handle(new GetCollectionsQuery
        {
            UserId = userId,
            PageNumber = 1,
            PageSize = 10
        }, CancellationToken.None);

        Assert.Equal(2, result.Data.Count);
        Assert.Equal("Favs", result.Data[0].Name);
        Assert.Equal(2, result.Data[0].RouteCount);
        Assert.Equal(0, result.Data[1].RouteCount);
        _repoMock.Verify(r => r.GetCollectionsByUserIdAsync(userId, 1, 10), Times.Once);
        _repoMock.Verify(r => r.GetAllCollectionsPagedAsync(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithoutUserId_ReturnsAllCollections()
    {
        var collections = new List<Collection>
        {
            new() { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), Name = "A", CollectionRoutes = new List<CollectionRoute>() },
            new() { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), Name = "B", CollectionRoutes = new List<CollectionRoute>() }
        };

        _repoMock.Setup(r => r.GetAllCollectionsPagedAsync(1, 10))
            .ReturnsAsync(collections);

        var result = await _handler.Handle(new GetCollectionsQuery
        {
            UserId = null,
            PageNumber = 1,
            PageSize = 10
        }, CancellationToken.None);

        Assert.Equal(2, result.Data.Count);
        _repoMock.Verify(r => r.GetAllCollectionsPagedAsync(1, 10), Times.Once);
        _repoMock.Verify(r => r.GetCollectionsByUserIdAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NullCollectionRoutes_ReturnsZeroCount()
    {
        var collections = new List<Collection>
        {
            new() { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), Name = "X", CollectionRoutes = null }
        };

        _repoMock.Setup(r => r.GetAllCollectionsPagedAsync(1, 10)).ReturnsAsync(collections);

        var result = await _handler.Handle(new GetCollectionsQuery { PageNumber = 1, PageSize = 10 }, CancellationToken.None);

        Assert.Equal(0, result.Data[0].RouteCount);
    }
}
