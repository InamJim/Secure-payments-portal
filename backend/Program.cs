using System.Text;
using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SecurePaymentsPortal.Data;
using SecurePaymentsPortal.Middleware;
using SecurePaymentsPortal.Services;

var builder = WebApplication.CreateBuilder(args);


// ── Services ─────────────────────────────────────────────────

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database (MySQL via Pomelo – parameterized queries via EF Core)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// JWT Authentication
var jwtKey      = builder.Configuration["Jwt:Key"]!;
var jwtIssuer   = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set true in production
    options.SaveToken            = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = jwtIssuer,
        ValidAudience            = jwtAudience,
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew                = TimeSpan.Zero  // No tolerance for expired tokens
    };
});

builder.Services.AddAuthorization();

// JWT service
builder.Services.AddScoped<IJwtService, JwtService>();

// Rate limiting (DDoS protection)
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(
builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// CORS – allow React dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ── Build app ────────────────────────────────────────────────
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

// ── Middleware pipeline (ORDER MATTERS) ──────────────────────

// HSTS should be first security transport rule
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

// Then enforce HTTPS redirection
app.UseHttpsRedirection();

// 1. Security headers (Clickjacking, XSS, HSTS, CSP)
app.UseSecurityHeaders();

// 2. HTTPS redirection (MitM protection)
app.UseHttpsRedirection();

// 3. Rate limiting (DDoS protection)
app.UseIpRateLimiting();

// 4. CORS
app.UseCors("ReactApp");

// 5. Routing
app.UseRouting();

// 6. Authentication & Authorisation
app.UseAuthentication();
app.UseAuthorization();

// 7. Controllers
app.MapControllers();

// ── Apply pending EF migrations on startup (optional) ────────
// Comment out if you prefer to run the SQL script manually.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        db.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Database initialisation failed. Ensure MySQL is running and connection string is correct.");
    }
}

app.Run();
