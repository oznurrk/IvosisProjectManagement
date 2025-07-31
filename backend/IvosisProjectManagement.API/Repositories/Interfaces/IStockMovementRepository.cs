using IvosisProjectManagement.API.DTOs;

public interface IStockMovementRepository : IBaseRepository<StockMovement>
    {
        Task<(IEnumerable<StockMovementDto> Movements, int TotalCount)> GetFilteredAsync(StockMovementFilterDto filter);
        Task<IEnumerable<StockMovementDto>> GetByStockItemAsync(int stockItemId, int take = 10);
        Task<IEnumerable<StockMovementDto>> GetByLocationAsync(int locationId, int take = 10);
        Task<IEnumerable<RecentMovementDto>> GetRecentMovementsAsync(int take = 10);
        Task<decimal> GetMonthlyTurnoverAsync(DateTime? month = null);
        Task<StockMovement> CreateMovementAsync(CreateStockMovementDto dto, int userId);
    }