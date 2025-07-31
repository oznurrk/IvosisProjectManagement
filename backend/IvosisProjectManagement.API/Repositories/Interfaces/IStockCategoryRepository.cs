 public interface IStockCategoryRepository : IBaseRepository<StockCategory>
    {
        Task<IEnumerable<StockCategoryDto>> GetAllWithDetailsAsync();
        Task<StockCategoryDto> GetByIdWithDetailsAsync(int id);
        Task<IEnumerable<StockCategoryDto>> GetMainCategoriesAsync();
        Task<IEnumerable<StockCategoryDto>> GetSubCategoriesAsync(int parentId);
        Task<bool> IsCategoryCodeUniqueAsync(string code, int? excludeId = null);
        Task<bool> HasItemsAsync(int categoryId);
    }