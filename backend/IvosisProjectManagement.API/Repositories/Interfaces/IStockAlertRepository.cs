public interface IStockAlertRepository : IBaseRepository<StockAlert>
    {
        Task<IEnumerable<StockAlertDto>> GetActiveAlertsAsync();
        Task<IEnumerable<StockAlertDto>> GetByStockItemAsync(int stockItemId);
        Task<IEnumerable<StockAlertDto>> GetByLocationAsync(int locationId);
        Task<int> GetActiveAlertCountAsync();
        Task MarkAsReadAsync(int alertId, int userId);
        Task CheckAndCreateAlertsAsync();
        Task CreateAlertAsync(int stockItemId, int locationId, string alertType, string alertLevel, string message);
    }