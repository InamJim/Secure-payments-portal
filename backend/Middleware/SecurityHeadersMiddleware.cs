namespace SecurePaymentsPortal.Middleware
{
    /// <summary>
    /// Adds security-related HTTP response headers:
    ///   - X-Frame-Options: prevents Clickjacking
    ///   - X-Content-Type-Options: prevents MIME sniffing
    ///   - X-XSS-Protection: legacy XSS filter hint
    ///   - Content-Security-Policy: restricts resource origins
    ///   - Strict-Transport-Security: enforces HTTPS (HSTS)
    ///   - Referrer-Policy: controls referrer leakage
    ///   - Permissions-Policy: disables unneeded browser features
    /// </summary>
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;

        public SecurityHeadersMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var headers = context.Response.Headers;

            // Clickjacking protection
            headers["X-Frame-Options"] = "DENY";

            // MIME sniffing protection
            headers["X-Content-Type-Options"] = "nosniff";

            // Legacy XSS protection (IE/older browsers)
            headers["X-XSS-Protection"] = "1; mode=block";

            // Content Security Policy
            headers["Content-Security-Policy"] =
                "default-src 'self'; " +
                "script-src 'self'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data:; " +
                "font-src 'self'; " +
                "connect-src 'self'; " +
                "frame-ancestors 'none';";

            // HSTS – enforces HTTPS for 1 year, includes subdomains
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";

            // Referrer policy
            headers["Referrer-Policy"] = "no-referrer";

            // Permissions policy – disable unneeded browser features
            headers["Permissions-Policy"] =
                "camera=(), microphone=(), geolocation=(), payment=()";

            await _next(context);
        }
    }

    public static class SecurityHeadersMiddlewareExtensions
    {
        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder builder)
            => builder.UseMiddleware<SecurityHeadersMiddleware>();
    }
}
