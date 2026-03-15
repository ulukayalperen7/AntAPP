using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Categories.Commands.DeleteCategoryById
{
    public class DeleteCategoryByIdCommand : IRequest<Guid>
    {
        public Guid Id { get; set; }
    }

    public class DeleteCategoryByIdCommandHandler : IRequestHandler<DeleteCategoryByIdCommand, Guid>
    {
        private readonly ICategoryRepositoryAsync _categoryRepositoryAsync;

        public DeleteCategoryByIdCommandHandler(ICategoryRepositoryAsync categoryRepositoryAsync)
        {
            _categoryRepositoryAsync = categoryRepositoryAsync;
        }

        public async Task<Guid> Handle(DeleteCategoryByIdCommand command, CancellationToken cancellationToken)
        {
            var category = await _categoryRepositoryAsync.GetByIdAsync(command.Id);
            if (category == null) throw new ApiException($"Category Not Found.");
            await _categoryRepositoryAsync.DeleteAsync(category);
            return category.Id;
        }
    }
}
