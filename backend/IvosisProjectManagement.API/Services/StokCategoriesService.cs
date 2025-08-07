using AutoMapper;
using IvosisProjectManagement.API.Data;
using Microsoft.EntityFrameworkCore;

namespace IvosisProjectManagement.API.Services.Implementations
{
    public class StockCategoryService : IStockCategoryService
    {
        private readonly IStockCategoryRepository _repository;
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _context;

        public StockCategoryService(IStockCategoryRepository repository, IMapper mapper, ApplicationDbContext context)
        {
            _repository = repository;
            _mapper = mapper;
            _context = context;
        }

        public async Task<IEnumerable<StockCategoryDto>> GetAllAsync()
        {
            return await _repository.GetAllWithDetailsAsync();
        }

        public async Task<StockCategoryDto> GetByIdAsync(int id)
        {
            var category = await _repository.GetByIdWithDetailsAsync(id);
            if (category == null)
                throw new KeyNotFoundException($"Kategori bulunamadı. ID: {id}");

            return category;
        }

        public async Task<IEnumerable<StockCategoryDto>> GetMainCategoriesAsync()
        {
            return await _repository.GetMainCategoriesAsync();
        }

        public async Task<IEnumerable<StockCategoryDto>> GetSubCategoriesAsync(int parentId)
        {
            return await _repository.GetSubCategoriesAsync(parentId);
        }

        public async Task<StockCategoryDto> CreateAsync(StockCategoryCreateDto createDto, int userId)
        {
            // Kod kontrolü
            var isCodeUnique = await _repository.IsCategoryCodeUniqueAsync(createDto.Code);
            if (!isCodeUnique)
                throw new InvalidOperationException($"Kategori kodu '{createDto.Code}' zaten kullanılmaktadır.");

            // Parent category kontrolü
            if (createDto.ParentCategoryId.HasValue)
            {
                var parentExists = await _context.StockCategories
                    .AnyAsync(x => x.Id == createDto.ParentCategoryId.Value);
                if (!parentExists)
                    throw new InvalidOperationException($"Ana kategori bulunamadı. ID: {createDto.ParentCategoryId}");
            }

            var category = _mapper.Map<StockCategory>(createDto);
            category.CreatedBy = userId;
            category.CreatedAt = DateTime.Now;

            // Entity'yi context'e ekle ve kaydet
            _context.StockCategories.Add(category);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(category.Id);
        }

        public async Task<StockCategoryDto> UpdateAsync(int id, StockCategoryUpdateDto updateDto, int userId)
        {
            var category = await _context.StockCategories
                .FirstOrDefaultAsync(x => x.Id == id);
            
            if (category == null)
                throw new KeyNotFoundException($"Kategori bulunamadı. ID: {id}");

            // Kod kontrolü (mevcut kategori hariç)
            var isCodeUnique = await _repository.IsCategoryCodeUniqueAsync(updateDto.Code, id);
            if (!isCodeUnique)
                throw new InvalidOperationException($"Kategori kodu '{updateDto.Code}' zaten kullanılmaktadır.");

            // Parent category kontrolü
            if (updateDto.ParentCategoryId.HasValue)
            {
                // Kendi kendisini parent yapamaz
                if (updateDto.ParentCategoryId == id)
                    throw new InvalidOperationException("Kategori kendi alt kategorisi olamaz.");

                var parentExists = await _context.StockCategories
                    .AnyAsync(x => x.Id == updateDto.ParentCategoryId.Value);
                if (!parentExists)
                    throw new InvalidOperationException($"Ana kategori bulunamadı. ID: {updateDto.ParentCategoryId}");
            }

            // Değerleri güncelle
            category.Name = updateDto.Name;
            category.Code = updateDto.Code;
            category.Description = updateDto.Description;
            category.ParentCategoryId = updateDto.ParentCategoryId;
            category.CompanyId = updateDto.CompanyId;
            category.IsActive = updateDto.IsActive;
            category.UpdatedBy = userId;
            category.UpdatedAt = DateTime.Now;

            // Entity'yi güncelle ve kaydet
            _context.StockCategories.Update(category);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _context.StockCategories
                .FirstOrDefaultAsync(x => x.Id == id);
            
            if (category == null)
                return false;

            // Alt kategorileri kontrol et
            var hasSubCategories = await _context.StockCategories
                .AnyAsync(x => x.ParentCategoryId == id);
            if (hasSubCategories)
                throw new InvalidOperationException("Alt kategorilere sahip kategori silinemez.");

            // Stok kalemlerini kontrol et
            var hasItems = await _repository.HasItemsAsync(id);
            if (hasItems)
                throw new InvalidOperationException("Stok kalemlerine sahip kategori silinemez.");

            // Entity'yi sil ve kaydet
            _context.StockCategories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsCategoryCodeUniqueAsync(string code, int? excludeId = null)
        {
            return await _repository.IsCategoryCodeUniqueAsync(code, excludeId);
        }
    }
}