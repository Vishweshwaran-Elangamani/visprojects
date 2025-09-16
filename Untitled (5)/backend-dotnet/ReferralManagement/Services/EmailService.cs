using System.Net.Mail;
using System.Net;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace ReferralManagement.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;
        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var smtp = new SmtpClient(_config["Smtp:Host"])
            {
                Port = int.Parse(_config["Smtp:Port"]),
                Credentials = new NetworkCredential(_config["Smtp:User"], _config["Smtp:Pass"]),
                EnableSsl = true
            };
            var mail = new MailMessage(_config["Smtp:User"], to, subject, body);
            await smtp.SendMailAsync(mail);
        }
    }
}
