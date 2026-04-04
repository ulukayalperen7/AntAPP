using Ant.Core.Entities;
using Ant.Application.Interfaces;

namespace Ant.Application.Interfaces.Repositories
{
    /// <summary>
    /// This is an "Interface" (a contract) for Tag database operations.
    /// It tells the system: "I can do everything a Generic Repository can do, but specifically for Tag."
    /// </summary>
    public interface ITagRepositoryAsync : IGenericRepositoryAsync<Tag>
    {
    }
}
