using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecurePaymentsPortal.Data;
using SecurePaymentsPortal.Models;

namespace SecurePaymentsPortal.Controllers
{
    [ApiController]
    [Route("api/admin/security")]
    [Authorize(Roles = "Admin")]
    public class AdminSecurityController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminSecurityController ( ApplicationDbContext db )
        {
            _db = db;
        }

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs ()
        {
            var logs = await _db.AuditLogs
                .OrderByDescending(x => x.Timestamp)
                .Take(200)
                .Select(x => new AuditLogResponseDto
                {
                    EventType = x.EventType,
                    AccountNumber = x.AccountNumber,
                    Details = x.Details,
                    Timestamp = x.Timestamp
                })
                .ToListAsync();

            return Ok(logs);
        }

        [HttpGet("failed-logins")]
        public async Task<IActionResult> GetFailedLogins ()
        {
            var failedLogins = await _db.AuditLogs
                .Where(x => x.EventType == "LOGIN_FAILED")
                .OrderByDescending(x => x.Timestamp)
                .Take(100)
                .Select(x => new AuditLogResponseDto
                {
                    EventType = x.EventType,
                    AccountNumber = x.AccountNumber,
                    Details = x.Details,
                    Timestamp = x.Timestamp
                })
                .ToListAsync();

            return Ok(failedLogins);
        }

        [HttpGet("rate-limit-events")]
        public async Task<IActionResult> GetRateLimitEvents ()
        {
            var rateLimitEvents = await _db.AuditLogs
                .Where(x =>
                    x.EventType == "RATE_LIMIT_TRIGGERED" ||
                    x.EventType == "BRUTE_FORCE_BLOCKED")
                .OrderByDescending(x => x.Timestamp)
                .Take(100)
                .Select(x => new AuditLogResponseDto
                {
                    EventType = x.EventType,
                    AccountNumber = x.AccountNumber,
                    Details = x.Details,
                    Timestamp = x.Timestamp
                })
                .ToListAsync();

            return Ok(rateLimitEvents);
        }
    }
}