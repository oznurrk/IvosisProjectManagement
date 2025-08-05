public interface IStockLocationService
{
    Task<List<StockLocationDto>> GetAllAsync();
    Task<StockLocationDto?> GetByIdAsync(int id);
    Task<StockLocationDto> CreateAsync(StockLocation entity);
    Task<bool> UpdateAsync(int id, StockLocation entity);
    Task<bool> DeleteAsync(int id);
}