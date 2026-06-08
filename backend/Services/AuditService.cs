using SecurePaymentsPortal.Data;
using SecurePaymentsPortal.Models;

namespace SecurePaymentsPortal.Services
{
    public class AuditService
    {
        private readonly ApplicationDbContext _db;

        public AuditService ( ApplicationDbContext db )
        {
            _db = db;
        }

        public async Task LogAsync ( string eventType, string? accountNumber, string? details )
        {
            var log = new AuditLog
            {
                EventType = eventType,
                AccountNumber = accountNumber,
                Details = details,
                IpAddress = null // can enhance later
            };

            _db.AuditLogs.Add(log);
            await _db.SaveChangesAsync();
        }
    }
}