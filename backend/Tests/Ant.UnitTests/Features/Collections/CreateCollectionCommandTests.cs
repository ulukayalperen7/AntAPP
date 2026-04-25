using Ant.Core.Entities;
using Ant.Application.Exceptions;
using Ant.Application.Features.Collections.Commands.CreateCollection;
using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Moq;

namespace Ant.UnitTests.Features.Collections;

public class CreateCollectionCommandTests
{
    private readonly Mock<ICollectionRepositoryAsync> _repoMock;
    private readonly Mock<IAuthenticatedUserService> _authMock;
    private readonly CreateCollectionCommandHandler _handler;

    public CreateCollectionCommandTests()
    {
        _repoMock = new Mock<ICollectionRepositoryAsync>();
        _authMock = new Mock<IAuthenticatedUserService>();
        _repoMock.Setup(r => r.AddAsync(It.IsAny<Collection>())).ReturnsAsync((Collection c) => { c.Id = Guid.NewGuid(); return c; });
        _handler = new CreateCollectionCommandHandler(_repoMock.Object, _authMock.Object);
    }

    /*
    [Fact]
    public async Task Handle_ShouldCreateCollection_WhenAuthenticated()
    {
        var userId = Guid.NewGuid();
        _authMock.Setup(a => a.UserId).Returns(userId.ToString());

        var result = await _handler.Handle(new CreateCollectionCommand
        {
            Name = "My Favorites",
            IsPublic = true,
            Description = "Best routes",
            ThumbnailUrl = "https://img.test/thumb.jpg"
        }, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        _repoMock.Verify(r => r.AddAsync(It.Is<Collection>(c =>
            c.UserId == userId &&
            c.Name == "My Favorites" &&
            c.IsPublic == true &&
            c.IsDefault == false
        )), Times.Once);
    }
    */

    [Fact]
    public async Task Handle_NullDescription_DefaultsToEmpty()
    {
        _authMock.Setup(a => a.UserId).Returns(Guid.NewGuid().ToString());

        await _handler.Handle(new CreateCollectionCommand
        {
            Name = "Test",
            Description = null,
            ThumbnailUrl = null
        }, CancellationToken.None);

        _repoMock.Verify(r => r.AddAsync(It.Is<Collection>(c =>
            c.Description == string.Empty &&
            c.ThumbnailUrl == string.Empty
        )), Times.Once);
    }

    [Fact]
    public async Task Handle_NotAuthenticated_ThrowsApiException()
    {
        _authMock.Setup(a => a.UserId).Returns((string?)null);

        await Assert.ThrowsAsync<ApiException>(() =>
            _handler.Handle(new CreateCollectionCommand { Name = "Test" }, CancellationToken.None));
    }
}
