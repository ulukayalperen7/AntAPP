namespace Ant.Infrastructure.Helpers
{
    public static class EmailTemplates
    {
        private const string Primary = "#EA580C";
        private const string PrimaryDark = "#C2410C";
        private const string Background = "#0F0F0F";
        private const string Surface = "#1A1A1A";
        private const string Border = "#2A2A2A";
        private const string TextPrimary = "#F9FAFB";
        private const string TextMuted = "#9CA3AF";

        private static string Wrap(string title, string bodyContent) => $@"<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
  <title>{title}</title>
</head>
<body style=""margin:0;padding:0;background-color:{Background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:{Background};padding:40px 20px;"">
    <tr>
      <td align=""center"">
        <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""max-width:520px;"">

          <!-- Logo header -->
          <tr>
            <td align=""center"" style=""padding-bottom:28px;"">
              <table cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td style=""background-color:{Primary};border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;"">
                    <span style=""font-size:20px;font-weight:700;color:#ffffff;line-height:36px;display:inline-block;width:36px;"">A</span>
                  </td>
                  <td style=""padding-left:10px;vertical-align:middle;"">
                    <span style=""font-size:20px;font-weight:700;color:{TextPrimary};letter-spacing:-0.5px;"">AntAPP</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style=""background-color:{Surface};border:1px solid {Border};border-radius:12px;padding:40px 36px;"">
              {bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align=""center"" style=""padding-top:24px;"">
              <p style=""margin:0;font-size:13px;color:{TextMuted};"">
                &copy; 2025 AntAPP &mdash; <a href=""https://antapp.fun"" style=""color:{Primary};text-decoration:none;"">antapp.fun</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

        public static string ConfirmEmail(string verificationUri) => Wrap(
            "Confirm Your Email — AntAPP",
            $@"<h1 style=""margin:0 0 8px;font-size:22px;font-weight:700;color:{TextPrimary};"">Confirm your email</h1>
              <p style=""margin:0 0 28px;font-size:15px;color:{TextMuted};line-height:1.6;"">
                Thanks for signing up! Click the button below to verify your email address and activate your account.
              </p>
              <table cellpadding=""0"" cellspacing=""0"" style=""margin-bottom:28px;"">
                <tr>
                  <td style=""background-color:{Primary};border-radius:8px;"">
                    <a href=""{verificationUri}"" style=""display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;"">Verify Email Address</a>
                  </td>
                </tr>
              </table>
              <p style=""margin:0 0 12px;font-size:13px;color:{TextMuted};"">Or copy and paste this link:</p>
              <p style=""margin:0 0 24px;font-size:13px;word-break:break-all;"">
                <a href=""{verificationUri}"" style=""color:{Primary};text-decoration:none;"">{verificationUri}</a>
              </p>
              <hr style=""border:none;border-top:1px solid {Border};margin:0 0 20px;"" />
              <p style=""margin:0;font-size:13px;color:{TextMuted};line-height:1.5;"">
                If you didn&rsquo;t create an AntAPP account, you can safely ignore this email.
              </p>"
        );

        public static string ResetPassword(string resetLink) => Wrap(
            "Reset Your Password — AntAPP",
            $@"<h1 style=""margin:0 0 8px;font-size:22px;font-weight:700;color:{TextPrimary};"">Reset your password</h1>
              <p style=""margin:0 0 28px;font-size:15px;color:{TextMuted};line-height:1.6;"">
                We received a request to reset the password for your AntAPP account. Click the button below to choose a new password.
              </p>
              <table cellpadding=""0"" cellspacing=""0"" style=""margin-bottom:28px;"">
                <tr>
                  <td style=""background-color:{Primary};border-radius:8px;"">
                    <a href=""{resetLink}"" style=""display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;"">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style=""margin:0 0 12px;font-size:13px;color:{TextMuted};"">Or copy and paste this link:</p>
              <p style=""margin:0 0 24px;font-size:13px;word-break:break-all;"">
                <a href=""{resetLink}"" style=""color:{Primary};text-decoration:none;"">{resetLink}</a>
              </p>
              <hr style=""border:none;border-top:1px solid {Border};margin:0 0 20px;"" />
              <p style=""margin:0;font-size:13px;color:{TextMuted};line-height:1.5;"">
                This link expires in 24 hours. If you didn&rsquo;t request a password reset, you can safely ignore this email.
              </p>"
        );
    }
}
