using SecurePaymentsPortal.Data;
using SecurePaymentsPortal.Models;

namespace SecurePaymentsPortal.Middleware
{
	public class RateLimitLoggingMiddleware
	{
		private readonly RequestDelegate _next;

		public RateLimitLoggingMiddleware ( RequestDelegate next )
		{
			_next = next;
		}

		public async Task Invoke ( HttpContext context, ApplicationDbContext db )
		{
			if ( context.Response.StatusCode == 429 )
			{
				db.RateLimitEvents.Add(new RateLimitEvent
				{
					AccountNumber = context.User?.Identity?.Name,
					Endpoint = context.Request.Path,
					IpAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
					Action = "BLOCKED"
				});

				await db.SaveChangesAsync();
			}

			await _next(context);
		}
	}
}