using System;

namespace CleanArchitecture.Core.Features.Tags.Queries.GetAllTags
{
    public class GetAllTagsViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
    }
}
