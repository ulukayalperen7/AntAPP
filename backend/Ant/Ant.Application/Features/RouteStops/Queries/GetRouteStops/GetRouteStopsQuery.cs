using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.RouteStops.Queries.GetRouteStops
{
    public class GetRouteStopsQuery : IRequest<Response<List<RouteStopViewModel>>>
    {
        public Guid RouteId { get; set; }
    }

    public class RouteStopViewModel
    {
        public Guid Id { get; set; }
        public Guid SpotId { get; set; }
        public int Order { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string PhotoUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string CustomTitle { get; set; }
        public string CustomDescription { get; set; }
    }

    public class GetRouteStopsQueryHandler : IRequestHandler<GetRouteStopsQuery, Response<List<RouteStopViewModel>>>
    {
        private readonly IRouteSpotRepositoryAsync _routeSpotRepository;

        public GetRouteStopsQueryHandler(IRouteSpotRepositoryAsync routeSpotRepository)
        {
            _routeSpotRepository = routeSpotRepository;
        }

        public async Task<Response<List<RouteStopViewModel>>> Handle(GetRouteStopsQuery request, CancellationToken cancellationToken)
        {
            var stops = await _routeSpotRepository.GetStopsForRouteAsync(request.RouteId);

            var viewModel = stops.Select(rs => new RouteStopViewModel
            {
                Id = rs.Id,
                SpotId = rs.SpotId,
                Order = rs.SpotOrder,
                Name = string.IsNullOrEmpty(rs.CustomTitle) ? rs.Spot.Name : rs.CustomTitle,
                Description = string.IsNullOrEmpty(rs.CustomDescription) ? rs.Spot.Description : rs.CustomDescription,
                PhotoUrl = string.IsNullOrEmpty(rs.CustomPhotoUrl) ? rs.Spot.PhotoUrl : rs.CustomPhotoUrl,
                Latitude = rs.Spot.Location?.Y ?? 0,
                Longitude = rs.Spot.Location?.X ?? 0,
                CustomTitle = rs.CustomTitle,
                CustomDescription = rs.CustomDescription
            }).ToList();

            return new Response<List<RouteStopViewModel>>(viewModel);
        }
    }
}
