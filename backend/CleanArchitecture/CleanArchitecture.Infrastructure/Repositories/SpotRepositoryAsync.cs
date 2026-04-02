using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Repository;

namespace CleanArchitecture.Infrastructure.Repositories
{
    /// <summary>
    /// Implementation of the Spot repository. 
    /// Inherits standard CRUD operations from GenericRepositoryAsync.
    /// </summary>
    public class SpotRepositoryAsync : GenericRepositoryAsync<Spot>, ISpotRepositoryAsync
    {
        private readonly ApplicationDbContext _dbContext;

        public SpotRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
