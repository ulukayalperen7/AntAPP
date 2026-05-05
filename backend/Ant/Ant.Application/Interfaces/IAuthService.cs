using Ant.Application.DTOs.Account;
using System.Threading.Tasks;

namespace Ant.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthenticationResponse> AuthenticateAsync(AuthenticationRequest request, string ipAddress);
        Task<AuthenticationResponse> RefreshTokenAsync(string token, string ipAddress);
        Task<string> RegisterAsync(RegisterRequest request, string origin);
        Task<string> ConfirmEmailAsync(string userId, string code);
        Task ForgotPassword(ForgotPasswordRequest model, string origin);
        Task ResendEmailConfirmationAsync(ForgotPasswordRequest model, string origin);
        Task<string> ResetPassword(ResetPasswordRequest model);
    }
}
