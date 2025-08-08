public interface IStockBalanceRepository : IBaseRepository<StockBalance>
    {
        Task<IEnumerable<StockBalanceDto>> GetAllWithDetailsAsync();
        Task<StockBalanceDto> GetByItemAndLocationAsync(int stockItemId, int locationId);
        Task<IEnumerable<StockBalanceDto>> GetByLocationAsync(int locationId);
        Task<IEnumerable<StockBalanceDto>> GetByStockItemAsync(int stockItemId);
        Task UpdateBalanceAsync(int stockItemId, int locationId, decimal quantity, string movementType, int userId);
        Task<decimal> GetAvailableStockAsync(int stockItemId, int locationId);
        Task<decimal> GetTotalStockAsync(int stockItemId);
    }