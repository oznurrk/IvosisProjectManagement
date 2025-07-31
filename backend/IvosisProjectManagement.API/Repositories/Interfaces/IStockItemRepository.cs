 public interface IStockItemRepository : IBaseRepository<StockItem>
    {
        Task<(IEnumerable<StockItemDto> Items, int TotalCount)> GetFilteredAsync(StockItemFilterDto filter);
        Task<StockItemDto> GetByIdWithDetailsAsync(int id);
        Task<StockItemDto> GetByCodeAsync(string itemCode);
        Task<IEnumerable<StockItemDto>> GetByCategoryAsync(int categoryId);
        Task<IEnumerable<StockItemDto>> GetLowStockItemsAsync();
        Task<IEnumerable<StockItemDto>> GetCriticalStockItemsAsync();
        Task<bool> IsItemCodeUniqueAsync(string itemCode, int? excludeId = null);
        Task<decimal> GetTotalStockValueAsync();
        Task<IEnumerable<StockItemDto>> SearchAsync(string searchTerm);
    }