using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SecurePaymentsPortal.Models
{
    [Table("payments")]
    public class Payment
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        [Required]
        [Column("UserId")]
        public int UserId { get; set; }

        [Required]
        [Column("Amount", TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [Column("Currency")]
        [MaxLength(10)]
        public string Currency { get; set; } = string.Empty;

        [Required]
        [Column("SwiftCode")]
        [MaxLength(11)]
        public string SwiftCode { get; set; } = string.Empty;

        [Required]
        [Column("RecipientAccount")]
        [MaxLength(12)]
        public string RecipientAccount { get; set; } = string.Empty;

        [Column("Status")]
        [MaxLength(20)]
        public string Status { get; set; } = "PENDING";

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("VerifiedAt")]
        public DateTime? VerifiedAt { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Column("AdminNote")]
        public string? AdminNote { get; set; }
    }
}
