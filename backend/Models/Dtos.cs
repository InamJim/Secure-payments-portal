using System.ComponentModel.DataAnnotations;

namespace SecurePaymentsPortal.Models
{
    // Auth DTOs 
    public class RegisterDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public string IdNumber { get; set; } = string.Empty;

        [Required]
        public string AccountNumber { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        [Required]
        public string AccountNumber { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
    }

    // Payment DTOs 
    public class CreatePaymentDto
    {
        [Required]
        public decimal Amount { get; set; }

        [Required]
        public string Currency { get; set; } = string.Empty;

        [Required]
        public string SwiftCode { get; set; } = string.Empty;

        [Required]
        public string RecipientAccount { get; set; } = string.Empty;
    }

    public class PaymentResponseDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string SwiftCode { get; set; } = string.Empty;
        public string RecipientAccount { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? VerifiedAt { get; set; }
    }
    // AuditLog DTOs
    public class AuditLogResponseDto
    {
        public string EventType { get; set; } = string.Empty;
        public string? AccountNumber { get; set; }
        public string? Details { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
