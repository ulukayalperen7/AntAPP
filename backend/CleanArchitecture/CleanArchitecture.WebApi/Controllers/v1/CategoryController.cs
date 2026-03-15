using CleanArchitecture.Core.Features.Categories.Commands.CreateCategory;
using CleanArchitecture.Core.Features.Categories.Commands.DeleteCategoryById;
using CleanArchitecture.Core.Features.Categories.Queries.GetAllCategories;
using CleanArchitecture.Core.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers.v1
{
    /// <summary>
    /// This controller handles all requests related to Categories (like Art, Food, Sightseeing).
    /// It acts as the "Entrance Door" for the mobile or web app to talk to our server.
    /// We use the Mediator pattern here to keep the code clean and separated.
    /// </summary>
    [ApiVersion("1.0")]
    public class CategoryController : BaseApiController
    {
        // 1. CREATE CATEGORY (POST) - This is where we add new categories to the database.
        // For example, if you want to add "Museums", you send it here.
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Post(CreateCategoryCommand command)
        {
            // We tell the Mediator to go and find the logic for "CreateCategory" and run it.
            return Ok(await Mediator.Send(command));
        }

        // 2. GET ALL CATEGORIES (GET) - This lists all categories we have.
        // This is public because everyone needs to see categories to pick one.
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<GetAllCategoriesViewModel>))]
        public async Task<IActionResult> Get([FromQuery] GetAllCategoriesParameter filter)
        {
            // Fetching a paginated list of categories.
            return Ok(await Mediator.Send(new GetAllCategoriesQuery() { PageSize = filter.PageSize, PageNumber = filter.PageNumber }));
        }

        // 3. DELETE CATEGORY (DELETE) - Removes a category by its ID.
        // SECURITY: Only an Admin can delete categories.
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
        public async Task<IActionResult> Delete(Guid id)
        {
            // Sending the delete command to the application layer.
            return Ok(await Mediator.Send(new DeleteCategoryByIdCommand { Id = id }));
        }
    }
}
