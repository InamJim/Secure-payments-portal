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
        private readonly AuditService _audit;

        public AuthController(
            ApplicationDbContext db,
            IJwtService jwt,
            ILogger<AuthController> logger,
            AuditService audit)
        {
            _db     = db;
            _jwt    = jwt;
            _logger = logger;
            _audit  = audit;
        }

        // POST /api/auth/register 
        [HttpPost("register")]
        public IActionResult Register()
        {
            return StatusCode(403, new
            {
                message = "User registration is disabled. Accounts are preconfigured by the system administrator."
            });
        }

        // POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid request body." });

            if (!InputValidationService.IsValidAccountNumber(dto.AccountNumber))
                return Unauthorized(new { message = "Invalid credentials." });

            // Retrieve user 
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.AccountNumber == dto.AccountNumber.Trim());

            // run lockout check after retrieving user
            if (user != null && user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
            {
                return Unauthorized(new
                {
                    message = "Account locked due to multiple failed login attempts. Try again later."
                });
            }

            string dummyHash = "$2a$12$invaliddummyhashvaluetopreventienumeeration00000000000";

            bool passwordValid = BCrypt.Net.BCrypt.Verify(
                dto.Password,
                user?.PasswordHash ?? dummyHash);

            // FAILED LOGIN BLOCK (UPDATED)
            if (user == null || !passwordValid)
            {
                if (user != null)
                {
                    user.FailedLoginAttempts++;

                    // Lock account after 5 failed attempts
                    if (user.FailedLoginAttempts >= 5)
                    {
                        user.LockoutEnd = DateTime.UtcNow.AddMinutes(1);
                        await _audit.LogAsync("ACCOUNT_LOCKED", user.AccountNumber, "Too many failed login attempts");
                    }

                    await _db.SaveChangesAsync();
                }

                _logger.LogWarning("Failed login attempt for AccountNumber={AccountNumber}", dto.AccountNumber);

                await _audit.LogAsync("LOGIN_FAILED", dto.AccountNumber, "Failed login attempt.");

                return Unauthorized(new { message = "Invalid account number or password." });
            }

            // SUCCESS LOGIN → RESET LOCKOUT
            user.FailedLoginAttempts = 0;
            user.LockoutEnd = null;

            await _db.SaveChangesAsync();

            var token = _jwt.GenerateToken(user);

            _logger.LogInformation("User logged in: AccountNumber={AccountNumber}, Role={Role}",
                user.AccountNumber, user.Role);

            await _audit.LogAsync("LOGIN_SUCCESS", user.AccountNumber, "User logged in successfully.");

            return Ok(new AuthResponseDto
            {
                Token = token,
                Role = user.Role,
                FullName = user.FullName,
                AccountNumber = user.AccountNumber
            });
        }
    }
}
