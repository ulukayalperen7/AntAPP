using AutoMapper;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Features.Tags.Queries.GetAllTags;

namespace CleanArchitecture.Core.Mappings
{
    public class GeneralProfile : Profile
    {
        public GeneralProfile()
        {
            CreateMap<GetAllTagsQuery, GetAllTagsParameter>();
            CreateMap<Tag, GetAllTagsViewModel>().ReverseMap();
        }
    }
}
