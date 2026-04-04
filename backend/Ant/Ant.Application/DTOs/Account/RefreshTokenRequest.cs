using System.Text.Json.Serialization;

namespace Ant.Application.DTOs.Account
{
    public class RefreshTokenRequest
    {
        [JsonPropertyName("refreshToken")]
        public string RefreshToken { get; set; }
    }
}
