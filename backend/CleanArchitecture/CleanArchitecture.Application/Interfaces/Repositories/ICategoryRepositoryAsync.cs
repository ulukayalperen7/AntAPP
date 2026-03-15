using CleanArchitecture.Core.Entities;

namespace CleanArchitecture.Core.Interfaces.Repositories
{
    /// <summary>
    /// This is an "Interface" (a contract) for Category database operations.
    /// It tells the system: "I can do everything a Generic Repository can do, but specifically for Category."
    /// Clean Architecture uses interfaces so we can easily swap data sources if we need to.
    /// </summary>
    public interface ICategoryRepositoryAsync : IGenericRepositoryAsync<Category>
    {
    }
}
