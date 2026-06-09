using SecurePaymentsPortal.Data;
using SecurePaymentsPortal.Models;
using Microsoft.AspNetCore.Http;

namespace SecurePaymentsPortal.Services
{
    public class AuditService
    {
        private readonly ApplicationDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;


        public AuditService ( ApplicationDbContext db, IHttpContextAccessor httpContextAccessor )
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogAsync ( string eventType, string? accountNumber, string? details )
        {
            var ip = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();

            var log = new AuditLog
            {
                EventType = eventType,
                AccountNumber = accountNumber,
                Details = details,
                IpAddress = ip,
                Timestamp = DateTime.UtcNow
            };

            _db.AuditLogs.Add(log);
            await _db.SaveChangesAsync();
        }
    }
}