using System.Security.Claims;
using System.Text;
using System.Text.Json;
using IvosisProjectManagement.API.Enums;
using IvosisProjectManagement.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace IvosisProjectManagement.API.Middleware
{
    public class ActivityLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ActivityLoggingMiddleware> _logger;
        private readonly IServiceProvider _serviceProvider;

        public ActivityLoggingMiddleware(RequestDelegate next, ILogger<ActivityLoggingMiddleware> logger,
            IServiceProvider serviceProvider)
        {
            _next = next;
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var startTime = DateTime.UtcNow;
            var requestBody = await ReadRequestBodyAsync(context.Request);

            await _next(context);

            var duration = DateTime.UtcNow - startTime;

            if (context.Request.Path.StartsWithSegments("/api"))
            {
                using var scope = _serviceProvider.CreateScope();
                var activityService = scope.ServiceProvider.GetService<IUserActivityService>();

                if (activityService != null && context.User.Identity?.IsAuthenticated == true)
                {
                    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
                    if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                    {
                        var activityInfo = new
                        {
                            Method = context.Request.Method,
                            Path = context.Request.Path.Value,
                            StatusCode = context.Response.StatusCode,
                            Duration = duration.TotalMilliseconds,
                            RequestBody = requestBody
                        };

                        await activityService.LogActivityAsync(userId, ActivityType.View, "API",
                            additionalInfo: JsonSerializer.Serialize(activityInfo));
                    }
                }
            }

            _logger.LogInformation("HTTP {Method} {Path} responded {StatusCode} in {Duration}ms",
                context.Request.Method, context.Request.Path, context.Response.StatusCode, duration.TotalMilliseconds);
        }

        private async Task<string> ReadRequestBodyAsync(HttpRequest request)
        {
            if (!request.HasFormContentType && request.ContentLength > 0)
            {
                request.EnableBuffering();
                using var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true);
                var body = await reader.ReadToEndAsync();
                request.Body.Position = 0;
                return body;
            }
            return string.Empty;
        }
    }
}
