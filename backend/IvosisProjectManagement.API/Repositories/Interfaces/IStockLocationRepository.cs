public interface IStockLocationRepository : IBaseRepository<StockLocation>
    {
        Task<IEnumerable<StockLocationDto>> GetAllWithDetailsAsync();
        Task<StockLocationDto> GetByIdWithDetailsAsync(int id);
        Task<bool> IsLocationCodeUniqueAsync(string code, int? excludeId = null);
        Task<bool> HasStockAsync(int locationId);
    }