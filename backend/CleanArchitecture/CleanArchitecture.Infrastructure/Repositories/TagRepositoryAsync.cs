using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitecture.Infrastructure.Repositories
{
    /// <summary>
    /// Concrete implementation of ITagRepositoryAsync.
    /// This class talks directly to the PostgreSQL database for Tag operations.
    /// </summary>
    public class TagRepositoryAsync : GenericRepositoryAsync<Tag>, ITagRepositoryAsync
    {
        private readonly DbSet<Tag> _tags;

        public TagRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _tags = dbContext.Set<Tag>();
        }
    }
}
