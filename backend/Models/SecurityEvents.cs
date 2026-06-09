using System;

namespace SecurePaymentsPortal.Models
{
    public class FailedLoginEvent
    {
        public int Id { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class RateLimitEvent
    {
        public int Id { get; set; }
        public string? AccountNumber { get; set; }
        public string Endpoint { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string Action { get; set; } = "BLOCKED";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}