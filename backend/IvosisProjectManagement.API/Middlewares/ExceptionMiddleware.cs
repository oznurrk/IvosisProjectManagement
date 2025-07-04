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
            await _next(context); // normal istek akışı
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message); // logla
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 500;

            string message = ex switch
            {
                ArgumentNullException => "Eksik parametre gönderildi.",
                UnauthorizedAccessException => "Yetkisiz erişim.",
                _ => _env.IsDevelopment() ? ex.Message : "Sunucu hatası oluştu."
            };

            var response = new
            {
                success = false,
                message = _env.IsDevelopment() ? ex.Message : "Sunucu hatası oluştu.",
                data = (object?)null
            };

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}
