using IvosisProjectManagement.API.DTOs.Common;
using IvosisProjectManagement.API.DTOs;

namespace IvosisProjectManagement.API.Services.Interfaces
{
    public interface IStockLotService
    {
        Task<Result<StockLotResponseDto>> GetByIdAsync(int id);
        Task<Result<PagedResult<StockLotListDto>>> GetAllAsync(StockLotFilterDto filter);
        Task<Result<StockLotResponseDto>> CreateAsync(StockLotCreateDto createDto, int userId);
        Task<Result<StockLotResponseDto>> UpdateAsync(int id, StockLotUpdateDto updateDto, int userId);
        Task<Result<bool>> DeleteAsync(int id, int userId);
        Task<Result<bool>> BlockLotAsync(int id, string blockReason, int userId);
        Task<Result<bool>> UnblockLotAsync(int id, int userId);
        Task<Result<List<StockLotListDto>>> GetByStockItemIdAsync(int stockItemId);
        Task<Result<List<StockLotListDto>>> GetAvailableLotsAsync(int stockItemId);
        Task<Result<bool>> CheckLotNumberExistsAsync(string lotNumber);
        Task<Result<StockLotResponseDto>> GetByLotNumberAsync(string lotNumber);
        Task<Result<bool>> UpdateCurrentQuantitiesAsync(int id, decimal currentWeight, decimal currentLength);
    }
}