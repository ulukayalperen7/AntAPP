using System.Text.Json.Serialization;

namespace CleanArchitecture.Core.DTOs.Account
{
    public class RefreshTokenRequest
    {
        [JsonPropertyName("refreshToken")]
        public string RefreshToken { get; set; }
    }
}
