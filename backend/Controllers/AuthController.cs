using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecurePaymentsPortal.Data;
using SecurePaymentsPortal.Models;
using SecurePaymentsPortal.Services;

namespace SecurePaymentsPortal.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IJwtService _jwt;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            ApplicationDbContext db,
            IJwtService jwt,
            ILogger<AuthController> logger)
        {
            _db     = db;
            _jwt    = jwt;
            _logger = logger;
        }

        // ── POST /api/auth/register ──────────────────────────────
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid request body." });

            // Whitelist validation
            if (!InputValidationService.IsValidFullName(dto.FullName))
                return BadRequest(new { message = "Full name must contain letters and spaces only (2–100 characters)." });

            if (!InputValidationService.IsValidIdNumber(dto.IdNumber))
                return BadRequest(new { message = "ID number must be exactly 13 digits." });

            if (!InputValidationService.IsValidAccountNumber(dto.AccountNumber))
                return BadRequest(new { message = "Account number must be 8–12 digits." });

            if (!InputValidationService.IsValidPassword(dto.Password))
                return BadRequest(new { message = "Password must be 8–128 characters and include uppercase, lowercase, digit, and special character." });

            // Check for duplicate account number (EF parameterized query – SQL injection safe)
            bool accountExists = await _db.Users
                .AnyAsync(u => u.AccountNumber == dto.AccountNumber.Trim());
            if (accountExists)
                return Conflict(new { message = "An account with this account number already exists." });

            // Check for duplicate ID number
            bool idExists = await _db.Users
                .AnyAsync(u => u.IdNumber == dto.IdNumber.Trim());
            if (idExists)
                return Conflict(new { message = "An account with this ID number already exists." });

            // Hash password with bcrypt (work factor 12)
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, workFactor: 12);

            var user = new User
            {
                FullName      = dto.FullName.Trim(),
                IdNumber      = dto.IdNumber.Trim(),
                AccountNumber = dto.AccountNumber.Trim(),
                PasswordHash  = passwordHash,
                Role          = "Customer"
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            _logger.LogInformation("New customer registered: AccountNumber={AccountNumber}", user.AccountNumber);

            return Ok(new { message = "Registration successful. You can now log in." });
        }

        // ── POST /api/auth/login ─────────────────────────────────
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid request body." });

            if (!InputValidationService.IsValidAccountNumber(dto.AccountNumber))
                return Unauthorized(new { message = "Invalid credentials." });

            // Retrieve user (parameterized via EF Core – SQL injection safe)
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.AccountNumber == dto.AccountNumber.Trim());

            // Constant-time comparison: always verify hash even if user not found
            // to prevent timing-based user enumeration
            string dummyHash = "$2a$12$invaliddummyhashvaluetopreventienumeeration00000000000";
            bool passwordValid = BCrypt.Net.BCrypt.Verify(
                dto.Password,
                user?.PasswordHash ?? dummyHash);

            if (user == null || !passwordValid)
            {
                _logger.LogWarning("Failed login attempt for AccountNumber={AccountNumber}", dto.AccountNumber);
                return Unauthorized(new { message = "Invalid account number or password." });
            }

            var token = _jwt.GenerateToken(user);

            _logger.LogInformation("User logged in: AccountNumber={AccountNumber}, Role={Role}",
                user.AccountNumber, user.Role);

            return Ok(new AuthResponseDto
            {
                Token         = token,
                Role          = user.Role,
                FullName      = user.FullName,
                AccountNumber = user.AccountNumber
            });
        }
    }
}
