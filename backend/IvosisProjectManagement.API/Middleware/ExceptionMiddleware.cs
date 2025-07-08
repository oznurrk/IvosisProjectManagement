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

                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                // 👉 Buraya ekleyeceksin
                string message = ex switch
                {
                    ArgumentNullException => "Eksik parametre gönderildi.",
                    UnauthorizedAccessException => "Yetkisiz erişim.",
                    _ => _env.IsDevelopment() ? ex.Message : "Sunucu hatası oluştu."
                };

                var response = new
                {
                    success = false,
                    message = message,
                    data = (object?)null
                };

                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

                await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
            }
        }
    }
}
