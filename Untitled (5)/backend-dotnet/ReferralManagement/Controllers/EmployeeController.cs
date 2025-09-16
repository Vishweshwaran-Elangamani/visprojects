using ReferralManagement.Models;
using Microsoft.AspNetCore.Mvc;
using ReferralManagement.Data;
using ReferralManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace ReferralManagement.Controllers
{
    [ApiController]
    [Route("api/employee")]
    public class EmployeeController : ControllerBase
    {
        private readonly ReferralDbContext _context;
        public EmployeeController(ReferralDbContext context)
        {
            _context = context;
        }

        // GET: api/employee/jobs
        [HttpGet("jobs")]
        public async Task<IActionResult> GetJobs()
        {
            var jobs = await _context.Jobs.ToListAsync();
            return Ok(jobs);
        }
            // POST: api/employee/submit-referral
            [HttpPost("submit-referral")]
            public async Task<IActionResult> SubmitReferral([FromBody] SubmitReferralRequest request)
            {
                if (request == null || string.IsNullOrEmpty(request.CandidateName) || string.IsNullOrEmpty(request.CandidateEmail) || request.JobId == 0)
                    return BadRequest("Missing required fields");

                // For demo, assume EmployeeId is passed in request (in real app, get from auth context)
                int employeeId = 0;
                if (User.Identity != null && User.Identity.IsAuthenticated)
                {
                    int.TryParse(User.Identity.Name, out employeeId);
                }
                if (employeeId == 0 && Request.Headers.ContainsKey("X-Employee-Id"))
                {
                    int.TryParse(Request.Headers["X-Employee-Id"], out employeeId);
                }
                if (employeeId == 0)
                {
                    // fallback: try to get from request (not secure, for demo)
                    if (Request.Query.ContainsKey("employeeId"))
                        int.TryParse(Request.Query["employeeId"], out employeeId);
                }
                if (employeeId == 0)
                    return BadRequest("EmployeeId not found");

                // Check referral limit
                var limit = await _context.ReferralLimits.FirstOrDefaultAsync(l => l.EmployeeId == employeeId);
                if (limit != null && limit.UsedCount >= limit.LimitCount)
                    return BadRequest($"Referral limit reached ({limit.LimitCount})");

                var referral = new Referral
                {
                    CandidateName = request.CandidateName,
                    CurrentCompany = request.CurrentCompany,
                    CandidateEmail = request.CandidateEmail,
                    ResumePdf = request.ResumePdfBase64,
                    JobId = request.JobId,
                    EmployeeId = employeeId,
                    Status = "Pending",
                    InterviewDateTime = null
                };
                _context.Referrals.Add(referral);
                if (limit != null)
                {
                    limit.UsedCount++;
                }
                await _context.SaveChangesAsync();
                return Ok(new { success = true, referralId = referral.Id });
            }

            // GET: api/employee/my-referrals
            [HttpGet("my-referrals")]
            public async Task<IActionResult> GetOwnReferrals()
            {
                int employeeId = 0;
                if (User.Identity != null && User.Identity.IsAuthenticated)
                {
                    int.TryParse(User.Identity.Name, out employeeId);
                }
                if (employeeId == 0 && Request.Headers.ContainsKey("X-Employee-Id"))
                {
                    int.TryParse(Request.Headers["X-Employee-Id"], out employeeId);
                }
                if (employeeId == 0)
                {
                    if (Request.Query.ContainsKey("employeeId"))
                        int.TryParse(Request.Query["employeeId"], out employeeId);
                }
                if (employeeId == 0)
                    return BadRequest("EmployeeId not found");

                var referrals = await _context.Referrals
                    .Where(r => r.EmployeeId == employeeId)
                    .Include(r => r.Job)
                    .ToListAsync();
                return Ok(referrals);
            }

            // DELETE: api/employee/my-referral/{id}
            [HttpDelete("my-referral/{id}")]
            public async Task<IActionResult> DeleteOwnReferral(int id, int employeeId)
            {
                var referral = await _context.Referrals.FirstOrDefaultAsync(r => r.Id == id && r.EmployeeId == employeeId);
                if (referral == null)
                    return NotFound("Referral not found or not owned by employee");
                _context.Referrals.Remove(referral);
                // Decrement used count if referral limit exists
                var limit = await _context.ReferralLimits.FirstOrDefaultAsync(l => l.EmployeeId == employeeId);
                if (limit != null && limit.UsedCount > 0)
                    limit.UsedCount--;
                await _context.SaveChangesAsync();
                return Ok(new { success = true });
            }

            // GET: api/employee/my-earnings
            [HttpGet("my-earnings")]
            public IActionResult GetEarnings()
            {
                // TODO: Return earnings for employee
                return Ok();
            }

            // POST: api/employee/change-password
            [HttpPost("change-password")]
            public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, int employeeId)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == employeeId);
                if (user == null)
                    return NotFound("User not found");
                // For demo: assume passwords are stored as plain text or hashed
                if (user.Password != request.OldPassword) // Replace with hash check if needed
                    return BadRequest("Old password incorrect");
                user.Password = request.NewPassword; // Replace with hash if needed
                user.FirstLogin = false;
                await _context.SaveChangesAsync();
                return Ok(new { success = true });
            }

        // POST: api/employee/referral
        [HttpPost("referral")]
        public async Task<IActionResult> SubmitReferral([FromBody] Referral referral)
        {
            var limit = await _context.ReferralLimits.FindAsync(referral.EmployeeId);
            if (limit != null && limit.UsedCount >= limit.LimitCount)
                return BadRequest("Referral limit exceeded");
            referral.Status = "Pending";
            _context.Referrals.Add(referral);
            if (limit != null)
                limit.UsedCount++;
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // GET: api/employee/referrals
        [HttpGet("referrals")]
        public async Task<IActionResult> GetReferrals(int employeeId)
        {
            var referrals = await _context.Referrals.Where(r => r.EmployeeId == employeeId).ToListAsync();
            return Ok(referrals);
        }

        // GET: api/employee/earnings
        [HttpGet("earnings")]
        public async Task<IActionResult> GetEarnings(int employeeId)
        {
            var earnings = await _context.Earnings
                .Include(e => e.Referral)
                .Where(e => e.Referral.EmployeeId == employeeId)
                .ToListAsync();
            return Ok(earnings);
        }
    }
}
