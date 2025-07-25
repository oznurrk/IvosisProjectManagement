using IvosisProjectManagement.API.Enums;
using IvosisProjectManagement.API.Models;

namespace IvosisProjectManagement.API.Services.Interfaces
{
    public interface IUserActivityService
    {
        Task LogActivityAsync(int userId, ActivityType activityType, string entity,
            int? entityId = null, object? oldValues = null, object? newValues = null,
            string? additionalInfo = null);

        Task LogLoginAsync(int userId, string ipAddress, string userAgent, bool isSuccessful);
        Task LogLogoutAsync(int userId, string ipAddress);
        Task<IEnumerable<UserActivityLog>> GetUserActivitiesAsync(int userId, int page = 1, int pageSize = 50);
        Task<IEnumerable<UserActivityLog>> GetSystemActivitiesAsync(DateTime? startDate = null,
            DateTime? endDate = null, int page = 1, int pageSize = 100);
        Task<IEnumerable<UserActivityLog>> GetEntityActivitiesAsync(string entity, int entityId);
    }
}
