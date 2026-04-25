using System;
using System.Collections.Generic;

namespace Ant.Core.Entities
{
    public class PostComment : BaseEntity
    {
        public PostComment()
        {
            Replies = new HashSet<PostComment>();
        }
        public Guid PostId { get; set; }
        public virtual Post Post { get; set; }

        public Guid UserId { get; set; }
        public virtual User User { get; set; }

        /// <summary>
        /// If this comment is a reply to another comment, this holds the ID of the original parent comment.
        /// Used for maintaining comment hierarchy.
        /// </summary>
        public Guid? ParentCommentId { get; set; }
        public virtual PostComment ParentComment { get; set; }
        public virtual ICollection<PostComment> Replies { get; set; }

        public string Content { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
