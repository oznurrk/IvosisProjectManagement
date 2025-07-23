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
builder.Services.AddScoped<IDashboardService, DashboardService>();


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
        };
    });

// ⬇️ CORS (Geliştirme için tamamen açık)
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
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
app.UseAuthentication();
app.UseAuthorization();


// ⬇️ Controller ve Hub Routing
app.MapControllers();
app.MapHub<ChatHub>("/chatHub");

app.Run();
