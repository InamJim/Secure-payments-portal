using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SecurePaymentsPortal.Models
{
    [Table("audit_logs")]
    public class AuditLog
    {
        [Key]
        public int Id { get; set; }

        public string EventType { get; set; } = string.Empty;

        public string? AccountNumber { get; set; }

        public string? IpAddress { get; set; }

        public string? Details { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}