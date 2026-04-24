using System;

namespace Ant.Core.Entities
{
    public class PostImage : BaseEntity
    {
        public Guid PostId { get; set; }
        public virtual Post Post { get; set; }

        public string ImageUrl { get; set; }
        public int SortOrder { get; set; }
    }
}
