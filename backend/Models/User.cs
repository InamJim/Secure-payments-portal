using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SecurePaymentsPortal.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        [Required]
        [Column("FullName")]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [Column("IdNumber")]
        [MaxLength(13)]
        public string IdNumber { get; set; } = string.Empty;

        [Required]
        [Column("AccountNumber")]
        [MaxLength(12)]
        public string AccountNumber { get; set; } = string.Empty;

        [Required]
        [Column("PasswordHash")]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [Column("Role")]
        [MaxLength(20)]
        public string Role { get; set; } = "Customer";

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();

        // SECURITY ADDITIONS (LOCKOUT SYSTEM)

        [Column("FailedLoginAttempts")]
        public int FailedLoginAttempts { get; set; } = 0;

        [Column("LockoutEnd")]
        public DateTime? LockoutEnd { get; set; }
    }
}
