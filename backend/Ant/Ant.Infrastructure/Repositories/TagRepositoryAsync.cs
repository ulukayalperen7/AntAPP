using Ant.Core.Entities;
using Ant.Application.Interfaces.Repositories;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace Ant.Infrastructure.Repositories
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
