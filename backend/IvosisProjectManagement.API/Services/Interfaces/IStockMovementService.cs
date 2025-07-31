using IvosisProjectManagement.API.DTOs;

public interface IStockMovementService
    {
        Task<(IEnumerable<StockMovementDto> Movements, int TotalCount)> GetFilteredAsync(StockMovementFilterDto filter);
        Task<StockMovementDto> GetByIdAsync(int id);
        Task<StockMovementDto> CreateStockInAsync(CreateStockMovementDto dto, int userId);
        Task<StockMovementDto> CreateStockOutAsync(CreateStockMovementDto dto, int userId);
        Task<StockMovementDto> CreateTransferAsync(int fromLocationId, int toLocationId, CreateStockMovementDto dto, int userId);
        Task<StockMovementDto> CreateAdjustmentAsync(CreateStockMovementDto dto, int userId);
        Task<IEnumerable<StockMovementDto>> GetByStockItemAsync(int stockItemId, int take = 10);
        Task<IEnumerable<RecentMovementDto>> GetRecentMovementsAsync(int take = 10);
        Task<decimal> GetMonthlyTurnoverAsync(DateTime? month = null);
    }