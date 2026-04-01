using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Infrastructure.Contexts;

namespace CleanArchitecture.Infrastructure.Repositories
{
    /// <summary>
    /// Implementation of the Route repository. 
    /// Inherits standard CRUD operations from GenericRepositoryAsync.
    /// </summary>
    public class RouteRepositoryAsync : GenericRepositoryAsync<Route>, IRouteRepositoryAsync
    {
        private readonly ApplicationDbContext _dbContext;

        public RouteRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
