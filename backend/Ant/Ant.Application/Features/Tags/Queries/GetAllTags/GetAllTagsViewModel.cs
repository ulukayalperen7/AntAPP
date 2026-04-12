using System;

namespace Ant.Application.Features.Tags.Queries.GetAllTags
{
    public class GetAllTagsViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
    }
}
