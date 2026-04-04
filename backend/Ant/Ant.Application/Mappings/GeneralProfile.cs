using AutoMapper;
using Ant.Core.Entities;
using Ant.Application.Features.Tags.Queries.GetAllTags;

namespace Ant.Application.Mappings
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
