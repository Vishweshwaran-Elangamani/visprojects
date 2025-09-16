using Microsoft.AspNetCore.Mvc;
using ReferralManagement.Data;
using ReferralManagement.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.Mail;
using System.Net;

namespace ReferralManagement.Controllers
{
    [ApiController]
    [Route("api/referral-management")]
    public class ReferralManagementController : ControllerBase
    {
        private readonly ReferralDbContext _context;
        public ReferralManagementController(ReferralDbContext context)
        {
            _context = context;
        }

        // GET: api/referral-management/referrals
        [HttpGet("referrals")]
        public async Task<IActionResult> GetReferrals()
        {
            var referrals = await _context.Referrals.Include(r => r.Job).Include(r => r.Employee).ToListAsync();
            return Ok(referrals);
        }

        // POST: api/referral-management/update-status
        [HttpPost("update-status")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateStatusRequest req)
        {
            var referral = await _context.Referrals.FindAsync(req.ReferralId);
            if (referral == null) return NotFound("Referral not found");
            // Sequential status logic
            var allowed = new Dictionary<string, string> {
                { "Pending", "Verified" },
                { "Verified", "Interview Scheduled" },
                { "Interview Scheduled", "Confirmed" }
            };
            if (!allowed.ContainsKey(referral.Status) || allowed[referral.Status] != req.NewStatus)
                return BadRequest("Invalid status transition");
            referral.Status = req.NewStatus;
            referral.InterviewDateTime = req.InterviewDateTime;
            await _context.SaveChangesAsync();
            // If confirmed, send email to candidate
            if (req.NewStatus == "Confirmed")
            {
                await SendEmailAsync(referral.CandidateEmail, "Congratulations – You have been confirmed!",
                    $"Dear {referral.CandidateName}, You have been confirmed for the role at our company.");
                // Add earning
                var earning = new Earning {
                    ReferralId = referral.Id,
                    Amount = referral.Job.ReferralBonus,
                    Date = DateTime.Now
                };
                _context.Earnings.Add(earning);
                await _context.SaveChangesAsync();
            }
            return Ok(new { success = true });
        }

        // GET: api/referral-management/search-referrals
        [HttpGet("search-referrals")]
        public async Task<IActionResult> SearchReferrals(string employeeName)
        {
            var referrals = await _context.Referrals
                .Include(r => r.Employee)
                .Where(r => r.Employee.Name.Contains(employeeName))
                .ToListAsync();
            return Ok(referrals);
        }

        private async Task SendEmailAsync(string to, string subject, string body)
        {
            var smtp = new SmtpClient("smtp.example.com")
            {
                Port = 587,
                Credentials = new NetworkCredential("your@email.com", "your_email_password"),
                EnableSsl = true
            };
            var mail = new MailMessage("your@email.com", to, subject, body);
            await smtp.SendMailAsync(mail);
        }
    }

    public class UpdateStatusRequest
    {
        public int ReferralId { get; set; }
        public string NewStatus { get; set; }
        public DateTime? InterviewDateTime { get; set; }
    }
}
