using System.Collections.Generic;

namespace CleanArchitecture.Core.Entities
{
    public class User : BaseEntity
    {
        // for business logic and data
        // we separate the data and the authentication
        public string UserName { get; set; }
        public string ProfilePhotoUrl { get; set; }

        // navigation properties
        public virtual ICollection<Route> AuthoredRoutes { get; set; }
        public virtual ICollection<Collection> Collections { get; set; }
        public virtual ICollection<RouteRating> RouteRatings { get; set; }
        public virtual ICollection<SpotRating> SpotRatings { get; set; }
    }
}
