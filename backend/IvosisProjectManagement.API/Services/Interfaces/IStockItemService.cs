using IvosisProjectManagement.API.DTOs;

public interface IStockItemService
{
    Task<(IEnumerable<StockItemDto> Items, int TotalCount)> GetFilteredAsync(StockItemFilterDto filter);
    Task<StockItemDto> GetByIdAsync(int id);
    Task<StockItemDto> GetByCodeAsync(string itemCode);
    Task<StockItemDto> CreateAsync(StockItemDtoCreate dto, int userId);
    Task<StockItemDto> UpdateAsync(int id, StockItemDtoUpdate dto, int userId);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<StockItemDto>> GetLowStockItemsAsync();
    Task<IEnumerable<StockItemDto>> GetCriticalStockItemsAsync();
    Task<IEnumerable<StockItemDto>> SearchAsync(string searchTerm);
    Task<bool> IsItemCodeUniqueAsync(string itemCode, int? excludeId = null);
        
    }