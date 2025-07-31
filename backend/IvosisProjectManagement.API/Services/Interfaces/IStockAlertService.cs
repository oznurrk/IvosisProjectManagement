  public interface IStockAlertService
    {
        Task<IEnumerable<StockAlertDto>> GetActiveAlertsAsync();
        Task<IEnumerable<StockAlertDto>> GetByStockItemAsync(int stockItemId);
        Task<int> GetActiveAlertCountAsync();
        Task MarkAsReadAsync(int alertId, int userId);
        Task CheckAndCreateAlertsAsync();
    }