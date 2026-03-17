using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Features.Collections.Commands.DeleteCollection;
using CleanArchitecture.Core.Interfaces.Repositories;
using Moq;

namespace CleanArchitecture.UnitTests.Features.Collections;

public class DeleteCollectionCommandTests
{
    private readonly Mock<ICollectionRepositoryAsync> _repoMock;
    private readonly DeleteCollectionCommandHandler _handler;

    public DeleteCollectionCommandTests()
    {
        _repoMock = new Mock<ICollectionRepositoryAsync>();
        _handler = new DeleteCollectionCommandHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldDelete_WhenOwnerMatches()
    {
        var userId = Guid.NewGuid();
        var collectionId = Guid.NewGuid();
        var collection = new Collection { Id = collectionId, UserId = userId };

        _repoMock.Setup(r => r.GetByIdAsync(collectionId)).ReturnsAsync(collection);

        var result = await _handler.Handle(new DeleteCollectionCommand
        {
            Id = collectionId,
            UserId = userId
        }, CancellationToken.None);

        Assert.Equal(collectionId, result);
        _repoMock.Verify(r => r.DeleteAsync(collection), Times.Once);
    }

    [Fact]
    public async Task Handle_CollectionNotFound_ThrowsApiException()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Collection?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new DeleteCollectionCommand { Id = Guid.NewGuid() }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WrongOwner_ThrowsApiException()
    {
        var collectionId = Guid.NewGuid();
        var collection = new Collection { Id = collectionId, UserId = Guid.NewGuid() };

        _repoMock.Setup(r => r.GetByIdAsync(collectionId)).ReturnsAsync(collection);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new DeleteCollectionCommand
            {
                Id = collectionId,
                UserId = Guid.NewGuid()
            }, CancellationToken.None));
    }
}
