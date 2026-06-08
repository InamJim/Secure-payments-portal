using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecurePaymentsPortal.Data;
using SecurePaymentsPortal.Models;
using SecurePaymentsPortal.Dtos;

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

        // GET: /api/admin/security/audit-logs
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
    }
}