using IvosisProjectManagement.API.DTOs.Dashboard;

namespace IvosisProjectManagement.API.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardDto> GetDashboardDataAsync();
        Task<DashboardDetailDto> GetDashboardDetailsAsync();
    }
}
