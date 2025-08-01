using System.Net;
using System.Text.Json;

namespace IvosisProjectManagement.API.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[EXCEPTION] {ex.Message}");

                int statusCode = ex switch
                {
                    ArgumentNullException => (int)HttpStatusCode.BadRequest,
                    UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
                    KeyNotFoundException => (int)HttpStatusCode.NotFound,
                    _ => (int)HttpStatusCode.InternalServerError
                };

                context.Response.ContentType = "application/problem+json";
                context.Response.StatusCode = statusCode;

                var problemDetails = new
                {
                    type = statusCode switch
                    {
                        400 => "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                        401 => "https://tools.ietf.org/html/rfc7235#section-3.1",
                        404 => "https://tools.ietf.org/html/rfc7231#section-6.5.4",
                        _ => "https://tools.ietf.org/html/rfc7231#section-6.6.1"
                    },
                    title = ex switch
                    {
                        ArgumentNullException => "Eksik parametre gönderildi.",
                        UnauthorizedAccessException => "Yetkisiz erişim.",
                        KeyNotFoundException => "Kayıt bulunamadı.",
                        _ => "Sunucu hatası oluştu."
                    },
                    status = statusCode,
                    detail = _env.IsDevelopment() ? ex.ToString() : null,
                    instance = context.Request.Path
                };

                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

                await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails, options));
            }
        }
    }
}
