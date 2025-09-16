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

        // POST: api/employee/referral
        [HttpPost("referral")]
        public async Task<IActionResult> SubmitReferral([FromBody] Referral referral)
        {
            if (referral == null || string.IsNullOrEmpty(referral.CandidateName) || string.IsNullOrEmpty(referral.CandidateEmail) || referral.JobId == 0 || referral.EmployeeId == 0)
                return BadRequest("Missing required fields");
            var limit = await _context.ReferralLimits.FirstOrDefaultAsync(l => l.EmployeeId == referral.EmployeeId);
            if (limit != null && limit.UsedCount >= limit.LimitCount)
                return BadRequest($"Referral limit reached ({limit.LimitCount})");
            referral.Status = "Pending";
            _context.Referrals.Add(referral);
            if (limit != null)
                limit.UsedCount++;
            await _context.SaveChangesAsync();
            return Ok(new { success = true, referralId = referral.Id });
        }

        // GET: api/employee/referrals?employeeId=123
        [HttpGet("referrals")]
        public async Task<IActionResult> GetReferrals([FromQuery] int employeeId)
        {
            if (employeeId == 0)
                return BadRequest("EmployeeId not found");
            var referrals = await _context.Referrals
                .Where(r => r.EmployeeId == employeeId)
                .Include(r => r.Job)
                .ToListAsync();
            return Ok(referrals);
        }


        // DELETE: api/employee/referral/{id}?employeeId=123
        [HttpDelete("referral/{id}")]
        public async Task<IActionResult> DeleteReferral(int id, [FromQuery] int employeeId)
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


        // GET: api/employee/earnings?employeeId=123
        [HttpGet("earnings")]
        public async Task<IActionResult> GetEarnings([FromQuery] int employeeId)
        {
            if (employeeId == 0)
                return BadRequest("EmployeeId not found");
            var earnings = await _context.Earnings
                .Include(e => e.Referral)
                .Where(e => e.Referral.EmployeeId == employeeId)
                .ToListAsync();
            return Ok(earnings);
        }


        // POST: api/employee/change-password?employeeId=123
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, [FromQuery] int employeeId)
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

        // (Removed duplicate endpoints below. Only one version of each endpoint remains above.)
    }
}
