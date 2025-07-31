using IvosisProjectManagement.API.Services.Interfaces;
using IvosisProjectManagement.API.DTOs;

namespace IvosisProjectManagement.API.Services.Implementations
{
    public class StockAlertService : IStockAlertService
    {
        private readonly IStockAlertRepository _stockAlertRepository;

        public StockAlertService(IStockAlertRepository stockAlertRepository)
        {
            _stockAlertRepository = stockAlertRepository;
        }

        public async Task<IEnumerable<StockAlertDto>> GetActiveAlertsAsync()
        {
            return await _stockAlertRepository.GetActiveAlertsAsync();
        }

        public async Task<IEnumerable<StockAlertDto>> GetByStockItemAsync(int stockItemId)
        {
            return await _stockAlertRepository.GetByStockItemAsync(stockItemId);
        }

        public async Task<int> GetActiveAlertCountAsync()
        {
            return await _stockAlertRepository.GetActiveAlertCountAsync();
        }

        public async Task MarkAsReadAsync(int alertId, int userId)
        {
            await _stockAlertRepository.MarkAsReadAsync(alertId, userId);
        }

        public async Task CheckAndCreateAlertsAsync()
        {
            await _stockAlertRepository.CheckAndCreateAlertsAsync();
        }
    }
}