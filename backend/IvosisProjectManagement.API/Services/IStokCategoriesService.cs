using IvosisProjectManagement.API.DTOs;

namespace IvosisProjectManagement.API.Services
{
    public interface IStockCategoryService
    {
        Task<IEnumerable<StockCategoryDto>> GetAllAsync();
        Task<StockCategoryDto> GetByIdAsync(int id);
        Task<IEnumerable<StockCategoryDto>> GetMainCategoriesAsync();
        Task<IEnumerable<StockCategoryDto>> GetSubCategoriesAsync(int parentId);
        Task<StockCategoryDto> CreateAsync(StockCategoryCreateDto createDto, int userId);
        Task<StockCategoryDto> UpdateAsync(int id, StockCategoryUpdateDto updateDto, int userId);
        Task<bool> DeleteAsync(int id);
        Task<bool> IsCategoryCodeUniqueAsync(string code, int? excludeId = null);
    }
}