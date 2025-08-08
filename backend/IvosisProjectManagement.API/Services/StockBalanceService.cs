
namespace IvosisProjectManagement.API.Services.Implementations
{
    public class StockBalanceService : IStockBalanceService
    {
        private readonly IStockBalanceRepository _stockBalanceRepository;

        public StockBalanceService(IStockBalanceRepository stockBalanceRepository)
        {
            _stockBalanceRepository = stockBalanceRepository;
        }

        public async Task<IEnumerable<StockBalanceDto>> GetAllAsync()
        {
            return await _stockBalanceRepository.GetAllWithDetailsAsync();
        }

        public async Task<StockBalanceDto> GetByItemAndLocationAsync(int stockItemId, int locationId)
        {
            return await _stockBalanceRepository.GetByItemAndLocationAsync(stockItemId, locationId);
        }

        public async Task<IEnumerable<StockBalanceDto>> GetByLocationAsync(int locationId)
        {
            return await _stockBalanceRepository.GetByLocationAsync(locationId);
        }

        public async Task<IEnumerable<StockBalanceDto>> GetByStockItemAsync(int stockItemId)
        {
            return await _stockBalanceRepository.GetByStockItemAsync(stockItemId);
        }

        public async Task<decimal> GetAvailableStockAsync(int stockItemId, int locationId)
        {
            return await _stockBalanceRepository.GetAvailableStockAsync(stockItemId, locationId);
        }

        public async Task<decimal> GetTotalStockAsync(int stockItemId)
        {
            return await _stockBalanceRepository.GetTotalStockAsync(stockItemId);
        }
        public async Task UpdateBalanceAsync(int stockItemId, int locationId, decimal quantity, string movementType, int userId)
        {
            await _stockBalanceRepository.UpdateBalanceAsync(stockItemId, locationId, quantity, movementType, userId);
        }
    }
}