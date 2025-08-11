using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using IvosisProjectManagement.API.DTOs.Common;
using IvosisProjectManagement.API.Middlewares;
using IvosisProjectManagement.API.Services.Interfaces;
using Serilog;
using IvosisProjectManagement.API.Repositories.Implementations;
using IvosisProjectManagement.API.Services.Implementations;
using IvosisProjectManagement.API.Profiles;


var builder = WebApplication.CreateBuilder(args);

// ⬇️ Controller desteği
builder.Services.AddControllers();

// ⬇️ .env dosyasını oku
DotNetEnv.Env.Load();
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");

// ⬇️ DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// ⬇️ Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// AutoMapper Configuration
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// ⬇️ Servis Katmanı
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IProcessService, ProcessService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IProjectTaskService, ProjectTaskService>();
builder.Services.AddScoped<CityService>();
builder.Services.AddScoped<DistrictService>();
builder.Services.AddScoped<NeighborhoodService>();
builder.Services.AddScoped<IProjectTypeService, ProjectTypeService>();
builder.Services.AddScoped<IPanelBrandService, PanelBrandService>();
builder.Services.AddScoped<IInverterBrandService, InverterBrandService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IUserActivityService, UserActivityService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IProjectAddressService, ProjectAddressService>();
builder.Services.AddScoped<IPersonnelService, PersonnelService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSignalR();
// Repository Registration
builder.Services.AddScoped<IStockItemRepository, StockItemRepository>();
builder.Services.AddScoped<IStockMovementRepository, StockMovementRepository>();
builder.Services.AddScoped<IStockBalanceRepository, StockBalanceRepository>();
builder.Services.AddScoped<IStockAlertRepository, StockAlertRepository>();
builder.Services.AddScoped<IStockCategoryRepository, StockCategoryRepository>();
builder.Services.AddScoped<IStockLocationRepository, StockLocationRepository>();
builder.Services.AddScoped<IUnitRepository, UnitRepository>();
builder.Services.AddScoped<ISupplierRepository, SupplierRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();

// Service Registration
builder.Services.AddScoped<IStockItemService, StockItemService>();
builder.Services.AddScoped<IStockMovementService, StockMovementService>();
builder.Services.AddScoped<IStockBalanceService, StockBalanceService>();
builder.Services.AddScoped<IStockAlertService, StockAlertService>();
builder.Services.AddScoped<IDashboardStockService, DashboardStockService>();
builder.Services.AddScoped<IAuthorizationService, AuthorizationService>();

builder.Services.AddScoped<IUnitService, UnitService>();
builder.Services.AddScoped<IStockLocationService, StockLocationService>();
builder.Services.AddScoped<IStockCategoryService, StockCategoryService>();

builder.Services.AddScoped<IStockLotService, StockLotService>();

builder.Services.AddScoped<IMaterialNameService, MaterialNameService>();
builder.Services.AddScoped<IMaterialTypeService, MaterialTypeService>();
builder.Services.AddScoped<IMaterialQualityService, MaterialQualityService>();

builder.Services.AddAutoMapper(typeof(StockManagementProfile));

builder.Services.AddMemoryCache();
builder.Services.AddAuthorization();
builder.Services.AddControllers();

// ⬇️ JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!);
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
            //ClockSkew = TimeSpan.Zero
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

// ⬇️ CORS (Geliştirme için tamamen açık)
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
        policy.WithOrigins("http://localhost:3000") 
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ⬇️ Model Validasyon Hatalarını Özelleştir
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
            .ToList();

        var result = Result<List<string>>.Failure("Gönderilen veriler geçerli değil.", errors);

        return new BadRequestObjectResult(result);
    };
});

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("Logs/system-log.txt", rollingInterval: RollingInterval.Day)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// ⬇️ SignalR
builder.Services.AddSignalR();

var app = builder.Build();

// ⬇️ Geliştirme Ortamında Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// ⬇️ Middleware Sıralaması
app.UseRouting();
app.UseCors("CorsPolicy");           // Routing'ten hemen sonra
app.UseMiddleware<ExceptionMiddleware>(); // Exception handler
app.UseMiddleware<IvosisProjectManagement.API.Middleware.ActivityLoggingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();


// ⬇️ Controller ve Hub Routing
app.MapControllers();
app.MapHub<ChatHub>("/chatHub");

app.Run();
