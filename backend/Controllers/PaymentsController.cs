using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecurePaymentsPortal.Data;
using SecurePaymentsPortal.Models;
using SecurePaymentsPortal.Services;

namespace SecurePaymentsPortal.Controllers
{
    [ApiController]
    [Route("api/payments")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<PaymentsController> _logger;
        private readonly AuditService _audit;

        public PaymentsController(
            ApplicationDbContext db,
            ILogger<PaymentsController> logger,
            AuditService audit)
        {
            _db = db;
            _logger = logger;
            _audit = audit;
        }

        // POST /api/payments/pay (Customer only)
        [HttpPost("pay")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid request body." });

            // Whitelist validation
            if (!InputValidationService.IsValidAmount(dto.Amount))
                return BadRequest(new { message = "Amount must be a positive number with up to 2 decimal places." });

            if (!InputValidationService.IsValidCurrency(dto.Currency))
                return BadRequest(new { message = "Currency must be 3–10 uppercase letters (e.g. USD, EUR)." });

            if (!InputValidationService.IsValidSwiftCode(dto.SwiftCode))
                return BadRequest(new { message = "SWIFT code must be 8 or 11 uppercase alphanumeric characters." });

            if (!InputValidationService.IsValidAccountNumber(dto.RecipientAccount))
                return BadRequest(new { message = "Recipient account number must be 8–12 digits." });

            if (dto.SwiftCode == dto.RecipientAccount)
                return BadRequest(new { message = "Invalid transfer details." });

            // Extract user ID from JWT claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Invalid token." });

            var payment = new Payment
            {
                UserId = userId,
                Amount = dto.Amount,
                Currency = dto.Currency.Trim().ToUpperInvariant(),
                SwiftCode = dto.SwiftCode.Trim().ToUpperInvariant(),
                RecipientAccount = dto.RecipientAccount.Trim(),
                Status = "PENDING"
            };

            _db.Payments.Add(payment);
            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "Payment created: Id={Id}, UserId={UserId}, Amount={Amount} {Currency}",
                payment.Id, userId, payment.Amount, payment.Currency);

            await _audit.LogAsync("PAYMENT_CREATED", userId.ToString(), $"Payment created for amount {payment.Amount} {payment.Currency}");

            return Ok(new { message = "Payment submitted successfully.", paymentId = payment.Id });
        }

        // GET /api/payments/all (Admin only)
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllPayments()
        {
            var payments = await _db.Payments
                .Include(p => p.User)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaymentResponseDto
                {
                    Id = p.Id,
                    CustomerName = p.User != null ? p.User.FullName : "Unknown",
                    AccountNumber = p.User != null ? p.User.AccountNumber : "Unknown",
                    Amount = p.Amount,
                    Currency = p.Currency,
                    SwiftCode = p.SwiftCode,
                    RecipientAccount = p.RecipientAccount,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt,
                    VerifiedAt = p.VerifiedAt
                })
                .ToListAsync();

            return Ok(payments);
        }

        // POST /api/payments/verify/{id} (Admin only)
        [HttpPost("verify/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> VerifyPayment(int id)
        {
            var payment = await _db.Payments.FindAsync(id);

            if (payment == null)
            {
                await _audit.LogAsync(
                    "PAYMENT_VERIFY_FAILED",
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                    $"Attempted to verify non-existent payment ID {id}"
                );

                return NotFound(new { message = "Payment not found." });
            }

            if (payment.Status != "PENDING")
            {
                await _audit.LogAsync(
                    "PAYMENT_VERIFY_BLOCKED",
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                    $"Attempted re-verification of payment ID {id} (Status: {payment.Status})"
                );

                return BadRequest(new { message = $"Payment is already {payment.Status}." });
            }

            payment.Status = "VERIFIED";
            payment.VerifiedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            await _audit.LogAsync(
                "PAYMENT_VERIFIED",
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                $"Payment ID {id} verified successfully"
            );

            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            _logger.LogInformation(
                "Payment verified: Id={Id}, AdminId={AdminId}",
                id, adminIdClaim
            );

            return Ok(new { message = "Payment verified and submitted to SWIFT.", paymentId = id });
        }

        [HttpPost("reject/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectPayment(int id, [FromBody] RejectPaymentDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Reason))
                return BadRequest(new { message = "Reason is required." });

            var payment = await _db.Payments.FindAsync(id);

            if (payment == null)
                return NotFound(new { message = "Payment not found." });

            if (payment.Status != "PENDING")
                return BadRequest(new { message = $"Payment is already {payment.Status}." });

            payment.Status = "REJECTED";
            payment.VerifiedAt = DateTime.UtcNow;
            payment.AdminNote = dto.Reason;

            await _db.SaveChangesAsync();

            await _audit.LogAsync(
                "PAYMENT_REJECTED",
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
                $"Payment ID {id} rejected. Reason: {dto.Reason}"
            );

            return Ok(new { message = "Payment rejected.", paymentId = id });
        }

        // GET /api/payments/my  (Customer – own payments)
        [HttpGet("my")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetMyPayments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Invalid token." });

            var payments = await _db.Payments
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaymentResponseDto
                {
                    Id = p.Id,
                    CustomerName = p.User != null ? p.User.FullName : "",
                    AccountNumber = p.User != null ? p.User.AccountNumber : "",
                    Amount = p.Amount,
                    Currency = p.Currency,
                    SwiftCode = p.SwiftCode,
                    RecipientAccount = p.RecipientAccount,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt,
                    VerifiedAt = p.VerifiedAt
                })
                .ToListAsync();

            return Ok(payments);
        }
    }
}
