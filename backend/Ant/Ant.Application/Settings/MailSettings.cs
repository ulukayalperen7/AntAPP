namespace Ant.Application.Settings
{
    public class MailSettings
    {
        public string EmailFrom { get; set; }
        public string DisplayName { get; set; }
        public string ResendApiKey { get; set; }
        public string ResendBaseUrl { get; set; } = "https://api.resend.com";
        public string SmtpHost { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUser { get; set; }
        public string SmtpPass { get; set; }
    }
}
