using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Categories.Commands.CreateCategory
{
    public class CreateCategoryCommand : IRequest<Guid>
    {
        public string Name { get; set; }
    }

    public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Guid>
    {
        private readonly ICategoryRepositoryAsync _categoryRepositoryAsync;



        public CreateCategoryCommandHandler(
            ICategoryRepositoryAsync categoryRepositoryAsync)
        {
            _categoryRepositoryAsync = categoryRepositoryAsync;
        }


        public async Task<Guid> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
        {
            var newCategory = new Category
            {
                Name = request.Name
            };

            await _categoryRepositoryAsync.AddAsync(newCategory);

            return newCategory.Id;
        }
    }
}
