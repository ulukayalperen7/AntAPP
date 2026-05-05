using Ant.Application.DTOs.Email;
using Ant.Application.Exceptions;
using Ant.Application.Interfaces;
using Ant.Application.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Ant.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly MailSettings _mailSettings;
        private readonly HttpClient _httpClient;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<MailSettings> mailSettings, HttpClient httpClient, ILogger<EmailService> logger)
        {
            _mailSettings = mailSettings.Value;
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task SendAsync(EmailRequest request)
        {
            if (string.IsNullOrWhiteSpace(_mailSettings.ResendApiKey))
                throw new ApiException("Resend API key is not configured.");

            var from = request.From ?? _mailSettings.EmailFrom;
            if (string.IsNullOrWhiteSpace(from))
                throw new ApiException("Email sender is not configured.");

            var baseUrl = string.IsNullOrWhiteSpace(_mailSettings.ResendBaseUrl)
                ? "https://api.resend.com"
                : _mailSettings.ResendBaseUrl.TrimEnd('/');

            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/emails");
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _mailSettings.ResendApiKey);
            httpRequest.Content = JsonContent.Create(new ResendEmailRequest
            {
                From = from,
                To = new[] { request.To },
                Subject = request.Subject,
                Html = request.Body
            });

            try
            {
                using var response = await _httpClient.SendAsync(httpRequest);
                if (response.IsSuccessStatusCode)
                    return;

                var responseBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("Resend email send failed with status {StatusCode}: {Body}", response.StatusCode, responseBody);
                throw new ApiException("Email could not be sent.");
            }
            catch (ApiException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Email could not be sent via Resend.");
                throw new ApiException("Email could not be sent.");
            }
        }

        private sealed class ResendEmailRequest
        {
            [JsonPropertyName("from")]
            public string From { get; set; }

            [JsonPropertyName("to")]
            public string[] To { get; set; }

            [JsonPropertyName("subject")]
            public string Subject { get; set; }

            [JsonPropertyName("html")]
            public string Html { get; set; }
        }
    }
}
