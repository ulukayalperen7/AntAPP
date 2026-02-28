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
    public class CreateCategoryCommand : IRequest<int>
    {
        public string Name { get; set; }
        public string Description { get; set; }
    }

    public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, int>
    {
        private readonly ICategoryRepositoryAsync _categoryRepositoryAsync;



        public CreateCategoryCommandHandler(
            ICategoryRepositoryAsync categoryRepositoryAsync)
        {
            _categoryRepositoryAsync = categoryRepositoryAsync;
        }


        public async Task<int> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
        {
            var newCategory = new Category
            {
                Name = request.Name,
                Description = request.Description
            };

            await _categoryRepositoryAsync.AddAsync(newCategory);

            return newCategory.Id;
        }
    }
}
