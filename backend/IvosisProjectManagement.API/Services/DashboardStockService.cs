
using IvosisProjectManagement.API.Services.Interfaces;

public class DashboardStockService : IDashboardStockService
{
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardStockService(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        return await _dashboardRepository.GetDashboardStatsAsync();
    }

    public async Task<IEnumerable<RecentMovementDto>> GetRecentMovementsAsync(int take = 10)
    {
        return await _dashboardRepository.GetRecentMovementsAsync(take);
    }

    public async Task<IEnumerable<StockAlertDto>> GetRecentAlertsAsync(int take = 5)
    {
        return await _dashboardRepository.GetRecentAlertsAsync(take);
    }
}