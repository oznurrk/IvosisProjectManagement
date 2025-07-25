using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Enums;
using IvosisProjectManagement.API.Models;
using IvosisProjectManagement.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace IvosisProjectManagement.API.Services
{
    public class UserActivityService : IUserActivityService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserActivityService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserActivityService(
            ApplicationDbContext context,
            ILogger<UserActivityService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogActivityAsync(int userId, ActivityType activityType, string entity,
            int? entityId = null, object? oldValues = null, object? newValues = null, string? additionalInfo = null)
        {
            try
            {
                var httpContext = _httpContextAccessor.HttpContext;
                var ipAddress = GetClientIpAddress();
                var userAgent = httpContext?.Request.Headers["User-Agent"].ToString() ?? "Unknown";

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning($"User with ID {userId} not found for activity logging");
                    return;
                }

                var activityLog = new UserActivityLog
                {
                    UserId = userId,
                    Username = user.Name,
                    Action = activityType.ToString(),
                    Entity = entity,
                    EntityId = entityId,
                    OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
                    NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
                    IpAddress = ipAddress,
                    UserAgent = userAgent,
                    AdditionalInfo = additionalInfo,
                    Timestamp = DateTime.UtcNow
                };

                await _context.UserActivityLogs.AddAsync(activityLog);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User Activity: {UserId} {Username} performed {Action} on {Entity} {EntityId} from {IpAddress}",
                    userId, user.Name, activityType, entity, entityId, ipAddress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging user activity for user {UserId}", userId);
            }
        }

        public async Task LogLoginAsync(int userId, string ipAddress, string userAgent, bool isSuccessful)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) return;

                var activityLog = new UserActivityLog
                {
                    UserId = userId,
                    Username = user.Name,
                    Action = isSuccessful ? ActivityType.Login.ToString() : "LoginFailed",
                    Entity = "Authentication",
                    IpAddress = ipAddress,
                    UserAgent = userAgent,
                    AdditionalInfo = JsonSerializer.Serialize(new { IsSuccessful = isSuccessful }),
                    Timestamp = DateTime.UtcNow
                };

                await _context.UserActivityLogs.AddAsync(activityLog);
                await _context.SaveChangesAsync();

                if (isSuccessful)
                {
                    _logger.LogInformation("Successful login: {Username} from {IpAddress}", user.Name, ipAddress);
                }
                else
                {
                    _logger.LogWarning("Failed login attempt: {Username} from {IpAddress}", user.Name, ipAddress);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging login activity for user {UserId}", userId);
            }
        }

        public async Task LogLogoutAsync(int userId, string ipAddress)
        {
            await LogActivityAsync(userId, ActivityType.Logout, "Authentication",
                additionalInfo: JsonSerializer.Serialize(new { IpAddress = ipAddress }));
        }

        public async Task<IEnumerable<UserActivityLog>> GetUserActivitiesAsync(int userId, int page = 1, int pageSize = 50)
        {
            return await _context.UserActivityLogs
                .Where(log => log.UserId == userId)
                .OrderByDescending(log => log.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserActivityLog>> GetSystemActivitiesAsync(DateTime? startDate = null,
            DateTime? endDate = null, int page = 1, int pageSize = 100)
        {
            var query = _context.UserActivityLogs.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(log => log.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(log => log.Timestamp <= endDate.Value);

            return await query
                .OrderByDescending(log => log.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(log => log.User)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserActivityLog>> GetEntityActivitiesAsync(string entity, int entityId)
        {
            return await _context.UserActivityLogs
                .Where(log => log.Entity == entity && log.EntityId == entityId)
                .OrderByDescending(log => log.Timestamp)
                .Include(log => log.User)
                .ToListAsync();
        }

        private string GetClientIpAddress()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return "Unknown";

            var xForwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(xForwardedFor))
            {
                return xForwardedFor.Split(',')[0].Trim();
            }

            var xRealIp = httpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(xRealIp))
            {
                return xRealIp;
            }

            return httpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }
    }
}
