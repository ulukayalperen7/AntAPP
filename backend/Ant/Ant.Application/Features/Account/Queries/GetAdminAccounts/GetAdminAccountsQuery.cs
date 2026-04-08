using Ant.Application.Interfaces;
using Ant.Application.Wrappers;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Ant.Application.Features.Account.Queries.GetAdminAccounts
{
    public class GetAdminAccountsQuery : IRequest<Response<IEnumerable<UserIdentityDto>>>
    {
    }

    public class GetAdminAccountsQueryHandler : IRequestHandler<GetAdminAccountsQuery, Response<IEnumerable<UserIdentityDto>>>
    {
        private readonly IIdentityService _identityService;

        public GetAdminAccountsQueryHandler(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        public async Task<Response<IEnumerable<UserIdentityDto>>> Handle(GetAdminAccountsQuery request, CancellationToken cancellationToken)
        {
            var users = await _identityService.GetAllUsersAsync();
            return new Response<IEnumerable<UserIdentityDto>>(users);
        }
    }
}
