using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Features.Collections.Commands.UpdateCollection;
using CleanArchitecture.Core.Interfaces.Repositories;
using Moq;

namespace CleanArchitecture.UnitTests.Features.Collections;

public class UpdateCollectionCommandTests
{
    private readonly Mock<ICollectionRepositoryAsync> _repoMock;
    private readonly UpdateCollectionCommandHandler _handler;

    public UpdateCollectionCommandTests()
    {
        _repoMock = new Mock<ICollectionRepositoryAsync>();
        _handler = new UpdateCollectionCommandHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldUpdate_WhenOwnerMatches()
    {
        var userId = Guid.NewGuid();
        var collectionId = Guid.NewGuid();
        var collection = new Collection { Id = collectionId, UserId = userId, Name = "Old" };

        _repoMock.Setup(r => r.GetByIdAsync(collectionId)).ReturnsAsync(collection);

        var result = await _handler.Handle(new UpdateCollectionCommand
        {
            Id = collectionId,
            UserId = userId,
            Name = "New Name",
            IsPublic = true,
            Description = "Updated",
            ThumbnailUrl = "https://new.jpg"
        }, CancellationToken.None);

        Assert.Equal(collectionId, result);
        Assert.Equal("New Name", collection.Name);
        Assert.True(collection.IsPublic);
        _repoMock.Verify(r => r.UpdateAsync(collection), Times.Once);
    }

    [Fact]
    public async Task Handle_AdminNoOwnerCheck_ShouldUpdate()
    {
        var collectionId = Guid.NewGuid();
        var collection = new Collection { Id = collectionId, UserId = Guid.NewGuid(), Name = "Old" };

        _repoMock.Setup(r => r.GetByIdAsync(collectionId)).ReturnsAsync(collection);

        var result = await _handler.Handle(new UpdateCollectionCommand
        {
            Id = collectionId,
            UserId = null,
            Name = "Admin Edit"
        }, CancellationToken.None);

        Assert.Equal(collectionId, result);
        Assert.Equal("Admin Edit", collection.Name);
    }

    [Fact]
    public async Task Handle_CollectionNotFound_ThrowsApiException()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Collection?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new UpdateCollectionCommand { Id = Guid.NewGuid() }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WrongOwner_ThrowsApiException()
    {
        var collectionId = Guid.NewGuid();
        var collection = new Collection { Id = collectionId, UserId = Guid.NewGuid() };

        _repoMock.Setup(r => r.GetByIdAsync(collectionId)).ReturnsAsync(collection);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new UpdateCollectionCommand
            {
                Id = collectionId,
                UserId = Guid.NewGuid()
            }, CancellationToken.None));
    }
}
