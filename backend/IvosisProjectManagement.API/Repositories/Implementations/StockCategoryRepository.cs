using Microsoft.EntityFrameworkCore;
using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Models;
using IvosisProjectManagement.API.DTOs;

namespace IvosisProjectManagement.API.Repositories.Implementations
{
    public class StockCategoryRepository : BaseRepository<StockCategory>, IStockCategoryRepository
    {
        public StockCategoryRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<StockCategoryDto>> GetAllWithDetailsAsync()
        {
            return await _context.StockCategories
                .Include(x => x.ParentCategory)
                .Include(x => x.CreatedByUser)
                .Include(x => x.UpdatedByUser)
                .Include(x => x.StockItems)
                .Select(x => new StockCategoryDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Code = x.Code,
                    Description = x.Description ?? "",
                    ParentCategoryId = x.ParentCategoryId,
                    ParentCategoryName = x.ParentCategory != null ? x.ParentCategory.Name : "",
                    IsActive = x.IsActive,
                    ItemCount = x.StockItems.Count,
                    CreatedAt = x.CreatedAt,
                    CreatedBy = x.CreatedBy ?? 0,
                    CreatedByName = x.CreatedByUser != null ? x.CreatedByUser.Name : "",
                    UpdatedAt = x.UpdatedAt,
                    UpdatedBy = x.UpdatedBy,
                    UpdatedByName = x.UpdatedByUser != null ? x.UpdatedByUser.Name : ""
                })
                .ToListAsync();
        }

        public async Task<StockCategoryDto> GetByIdWithDetailsAsync(int id)
        {
            return await _context.StockCategories
                .Include(x => x.ParentCategory)
                .Include(x => x.CreatedByUser)
                .Include(x => x.UpdatedByUser)
                .Include(x => x.StockItems)
                .Where(x => x.Id == id)
                .Select(x => new StockCategoryDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Code = x.Code,
                    Description = x.Description ?? "",
                    ParentCategoryId = x.ParentCategoryId,
                    ParentCategoryName = x.ParentCategory != null ? x.ParentCategory.Name : "",
                    IsActive = x.IsActive,
                    ItemCount = x.StockItems.Count,
                    CreatedAt = x.CreatedAt,
                    CreatedBy = x.CreatedBy ?? 0,
                    CreatedByName = x.CreatedByUser != null ? x.CreatedByUser.Name : ""
                })
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<StockCategoryDto>> GetMainCategoriesAsync()
        {
            return await _context.StockCategories
                .Where(x => x.ParentCategoryId == null && x.IsActive)
                .Select(x => new StockCategoryDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Code = x.Code,
                    Description = x.Description ?? ""
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<StockCategoryDto>> GetSubCategoriesAsync(int parentId)
        {
            return await _context.StockCategories
                .Where(x => x.ParentCategoryId == parentId && x.IsActive)
                .Select(x => new StockCategoryDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Code = x.Code,
                    Description = x.Description ?? ""
                })
                .ToListAsync();
        }

        public async Task<bool> IsCategoryCodeUniqueAsync(string code, int? excludeId = null)
        {
            var query = _context.StockCategories.Where(x => x.Code == code);
            if (excludeId.HasValue)
                query = query.Where(x => x.Id != excludeId.Value);
            return !await query.AnyAsync();
        }

        public async Task<bool> HasItemsAsync(int categoryId)
        {
            return await _context.StockItems.AnyAsync(x => x.CategoryId == categoryId);
        }
    }
}