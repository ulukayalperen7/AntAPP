using Ant.Application.DTOs.Email;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendAsync(EmailRequest request);
    }
}
