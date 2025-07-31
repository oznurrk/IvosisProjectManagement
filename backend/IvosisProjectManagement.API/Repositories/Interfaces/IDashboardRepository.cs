 public interface IDashboardRepository
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<IEnumerable<RecentMovementDto>> GetRecentMovementsAsync(int take = 10);
        Task<IEnumerable<StockAlertDto>> GetRecentAlertsAsync(int take = 5);
    }