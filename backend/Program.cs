using System.Text;
using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SecurePaymentsPortal.Data;
using SecurePaymentsPortal.Middleware;
using SecurePaymentsPortal.Services;

var builder = WebApplication.CreateBuilder(args);


// Services 

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database (MySQL)
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
    options.RequireHttpsMetadata = false; 
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
        ClockSkew                = TimeSpan.Zero  
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

// CORS 
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Build app 
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

// Middleware pipeline

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

// Enforce HTTPS redirection
app.UseHttpsRedirection();

// Security headers (Clickjacking, XSS, HSTS, CSP)
app.UseSecurityHeaders();

// HTTPS redirection (MitM protection)
app.UseHttpsRedirection();

// Rate limiting (DDoS protection)
app.UseIpRateLimiting();

// CORS
app.UseCors("ReactApp");

// Routing
app.UseRouting();

// Authentication & Authorisation
app.UseAuthentication();
app.UseAuthorization();

// Controllers
app.MapControllers();

// Apply pending EF migrations on startup (optional) 
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
