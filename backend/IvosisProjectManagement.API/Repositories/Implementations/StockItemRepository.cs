using System.Linq.Expressions;
using IvosisProjectManagement.API.Data;
using Microsoft.EntityFrameworkCore;

public class StockItemRepository : BaseRepository<StockItem>, IStockItemRepository
{
    public StockItemRepository(ApplicationDbContext context) : base(context) { }

    public async Task<(IEnumerable<StockItemDto> Items, int TotalCount)> GetFilteredAsync(StockItemFilterDto filter)
    {
        try
        {
            // İlişkili tabloları include edin
            var query = _context.StockItems
                .Include(x => x.Category)
                .Include(x => x.Unit)
                .Include(x => x.CreatedByUser)
                .Include(x => x.StockBalances)
                .AsQueryable();

            // Apply filters (güvenli şekilde)
            if (!string.IsNullOrEmpty(filter.Search))
            {
                query = query.Where(x => (x.Name ?? "").Contains(filter.Search) ||
                                        (x.ItemCode ?? "").Contains(filter.Search) ||
                                        (x.Brand ?? "").Contains(filter.Search));
            }

            if (filter.CategoryId.HasValue)
            {
                query = query.Where(x => x.CategoryId == filter.CategoryId.Value);
            }

            if (filter.IsActive.HasValue)
            {
                query = query.Where(x => x.IsActive == filter.IsActive.Value);
            }

            if (filter.IsCritical.HasValue)
            {
                query = query.Where(x => x.IsCriticalItem == filter.IsCritical.Value);
            }

            if (filter.CreatedFrom.HasValue)
            {
                query = query.Where(x => x.CreatedAt >= filter.CreatedFrom.Value);
            }

            if (filter.CreatedTo.HasValue)
            {
                query = query.Where(x => x.CreatedAt <= filter.CreatedTo.Value);
            }

            var totalCount = await query.CountAsync();

            // Apply sorting (güvenli şekilde) - SortDirection null olabilir
            query = (!string.IsNullOrEmpty(filter.SortDirection) && filter.SortDirection.ToUpper() == "DESC")
                ? query.OrderByDescending(GetSortExpression(filter.SortBy))
                : query.OrderBy(GetSortExpression(filter.SortBy));

            // Apply pagination
            query = query.Skip((filter.Page - 1) * filter.PageSize)
                        .Take(filter.PageSize);

           
            var items = await query.Select(x => new StockItemDto
            {
                Id = x.Id,
                ItemCode = x.ItemCode ?? "",
                Name = x.Name ?? "",
                Description = x.Description ?? "",
                CategoryId = x.CategoryId,
                CategoryName = x.Category != null ? x.Category.Name ?? "" : "",
                UnitId = x.UnitId,
                UnitName = x.Unit != null ? x.Unit.Name ?? "" : "",
                MinimumStock = x.MinimumStock,
                MaximumStock = x.MaximumStock,
                ReorderLevel = x.ReorderLevel,
                PurchasePrice = x.PurchasePrice,
                SalePrice = x.SalePrice,
                Currency = x.Currency ?? "",
                Brand = x.Brand ?? "",
                Model = x.Model ?? "",
                Specifications = x.Specifications ?? "",
                QualityStandards = x.QualityStandards ?? "",
                CertificateNumbers = x.CertificateNumbers ?? "",
                StorageConditions = x.StorageConditions ?? "",
                ShelfLife = x.ShelfLife,
                IsActive = x.IsActive,
                IsDiscontinued = x.IsDiscontinued,
                IsCriticalItem = x.IsCriticalItem,
                CreatedAt = x.CreatedAt,
                CreatedBy = x.CreatedBy ?? 0,
                CreatedByName = x.CreatedByUser != null ? (x.CreatedByUser.Name ?? "") : "",
                UpdatedAt = x.UpdatedAt,
                UpdatedBy = x.UpdatedBy,
                
                // StockBalances null safe hesaplaması  
                CurrentStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.CurrentQuantity) : 0,
                AvailableStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.AvailableQuantity) : 0,
                ReservedStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.ReservedQuantity) : 0,
                StockStatus = DetermineStockStatusSafe(
                    x.StockBalances != null ? x.StockBalances.Sum(b => b.AvailableQuantity) : 0,
                    x.StockBalances != null ? x.StockBalances.Sum(b => b.CurrentQuantity) : 0,
                    x.MinimumStock,
                    x.MaximumStock)
               
          
            }).ToListAsync();

            return (items, totalCount);
        }
        catch (Exception ex)
        {
            throw new Exception($"Repository GetFilteredAsync Error: {ex.Message} - Inner: {ex.InnerException?.Message}", ex);
        }   
        
    }
    // Stock status'u hesaplayan yardımcı method - NULL SAFE
    private static string DetermineStockStatusSafe(decimal availableStock, decimal currentStock, decimal minimumStock, decimal maximumStock)
    {
        if (currentStock <= 0)
            return "OUT_OF_STOCK";
        else if (availableStock <= minimumStock)
            return "LOW_STOCK";
        else if (currentStock >= maximumStock)
            return "OVERSTOCK";
        else
          return "NORMAL";
    }

    public async Task<StockItemDto> GetByIdWithDetailsAsync(int id)
    {
        return await _context.StockItems
            .Include(x => x.Category)
            .Include(x => x.Unit)
            .Include(x => x.CreatedByUser)
            .Include(x => x.UpdatedByUser)
            .Include(x => x.StockBalances)
            .Where(x => x.Id == id)
            .Select(x => new StockItemDto
            {
                Id = x.Id,
                ItemCode = x.ItemCode,
                Name = x.Name,
                Description = x.Description,
                CategoryId = x.CategoryId,
                CategoryName = x.Category.Name,
                UnitId = x.UnitId,
                UnitName = x.Unit.Name,
                MinimumStock = x.MinimumStock,
                MaximumStock = x.MaximumStock,
                ReorderLevel = x.ReorderLevel,
                PurchasePrice = x.PurchasePrice,
                SalePrice = x.SalePrice,
                Currency = x.Currency,
                Brand = x.Brand,
                Model = x.Model,
                Specifications = x.Specifications,
                QualityStandards = x.QualityStandards,
                CertificateNumbers = x.CertificateNumbers,
                StorageConditions = x.StorageConditions,
                ShelfLife = x.ShelfLife,
                IsActive = x.IsActive,
                IsDiscontinued = x.IsDiscontinued,
                IsCriticalItem = x.IsCriticalItem,
                CreatedAt = x.CreatedAt,
                CreatedBy = x.CreatedBy ?? 0,
                CreatedByName = x.CreatedByUser.Name,
                UpdatedAt = x.UpdatedAt,
                UpdatedBy = x.UpdatedBy,
                UpdatedByName = x.UpdatedByUser != null ? x.UpdatedByUser.Name : null,
                CurrentStock = x.StockBalances.Sum(b => b.CurrentQuantity),
                AvailableStock = x.StockBalances.Sum(b => b.AvailableQuantity),
                ReservedStock = x.StockBalances.Sum(b => b.ReservedQuantity),
                StockStatus = x.StockBalances.Sum(b => b.AvailableQuantity) <= x.MinimumStock ? "LOW_STOCK" :
                             x.StockBalances.Sum(b => b.CurrentQuantity) >= x.MaximumStock ? "OVERSTOCK" : "NORMAL"
            })
            .FirstOrDefaultAsync();
    }

    public async Task<StockItemDto> GetByCodeAsync(string itemCode)
    {
        return await _context.StockItems
            .Include(x => x.Category)
            .Include(x => x.Unit)
            .Include(x => x.StockBalances)
            .Where(x => x.ItemCode == itemCode)
            .Select(x => new StockItemDto
            {
                Id = x.Id,
                ItemCode = x.ItemCode,
                Name = x.Name,
                CategoryName = x.Category.Name,
                UnitName = x.Unit.Name,
                CurrentStock = x.StockBalances.Sum(b => b.CurrentQuantity),
                AvailableStock = x.StockBalances.Sum(b => b.AvailableQuantity),
                MinimumStock = x.MinimumStock,
                MaximumStock = x.MaximumStock
            })
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<StockItemDto>> GetByCategoryAsync(int categoryId)
    {
        return await _context.StockItems
            .Include(x => x.Category)
            .Include(x => x.Unit)
            .Include(x => x.StockBalances)
            .Where(x => x.CategoryId == categoryId && x.IsActive)
            .Select(x => new StockItemDto
            {
                Id = x.Id,
                ItemCode = x.ItemCode,
                Name = x.Name,
                CategoryName = x.Category.Name,
                UnitName = x.Unit.Name,
                CurrentStock = x.StockBalances.Sum(b => b.CurrentQuantity),
                AvailableStock = x.StockBalances.Sum(b => b.AvailableQuantity),
                MinimumStock = x.MinimumStock,
                StockStatus = x.StockBalances.Sum(b => b.AvailableQuantity) <= x.MinimumStock ? "LOW_STOCK" : "NORMAL"
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<StockItemDto>> GetLowStockItemsAsync()
    {
        return await _context.StockItems
            .Include(x => x.Category)
            .Include(x => x.Unit)
            .Include(x => x.StockBalances)
            .Where(x => x.IsActive && x.StockBalances.Sum(b => b.AvailableQuantity) <= x.MinimumStock)
            .Select(x => new StockItemDto
            {
                Id = x.Id,
                ItemCode = x.ItemCode,
                Name = x.Name,
                CategoryName = x.Category.Name,
                UnitName = x.Unit.Name,
                CurrentStock = x.StockBalances.Sum(b => b.CurrentQuantity),
                AvailableStock = x.StockBalances.Sum(b => b.AvailableQuantity),
                MinimumStock = x.MinimumStock,
                StockStatus = "LOW_STOCK"
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<StockItemDto>> GetCriticalStockItemsAsync()
    {
        return await _context.StockItems
            .Include(x => x.Category)
            .Include(x => x.Unit)
            .Include(x => x.StockBalances)
            .Where(x => x.IsActive && x.IsCriticalItem && x.StockBalances.Sum(b => b.AvailableQuantity) <= x.ReorderLevel)
            .Select(x => new StockItemDto
            {
                Id = x.Id,
                ItemCode = x.ItemCode,
                Name = x.Name,
                CategoryName = x.Category.Name,
                UnitName = x.Unit.Name,
                CurrentStock = x.StockBalances.Sum(b => b.CurrentQuantity),
                AvailableStock = x.StockBalances.Sum(b => b.AvailableQuantity),
                MinimumStock = x.MinimumStock,
                ReorderLevel = x.ReorderLevel,
                IsCriticalItem = x.IsCriticalItem,
                StockStatus = "CRITICAL"
            })
            .ToListAsync();
    }

    public async Task<bool> IsItemCodeUniqueAsync(string itemCode, int? excludeId = null)
    {
        var query = _context.StockItems.Where(x => x.ItemCode == itemCode);

        if (excludeId.HasValue)
            query = query.Where(x => x.Id != excludeId.Value);

        return !await query.AnyAsync();
    }

    public async Task<decimal> GetTotalStockValueAsync()
    {
        return await _context.StockBalances
            .Include(x => x.StockItem)
            .SumAsync(x => x.CurrentQuantity * x.StockItem.PurchasePrice);
    }

    public async Task<IEnumerable<StockItemDto>> SearchAsync(string searchTerm)
    {
        return await _context.StockItems
            .Include(x => x.Category)
            .Include(x => x.Unit)
            .Include(x => x.StockBalances)
            .Where(x => x.IsActive &&
                       (x.Name.Contains(searchTerm) ||
                        x.ItemCode.Contains(searchTerm) ||
                        x.Brand.Contains(searchTerm)))
            .Select(x => new StockItemDto
            {
                Id = x.Id,
                ItemCode = x.ItemCode,
                Name = x.Name,
                CategoryName = x.Category.Name,
                UnitName = x.Unit.Name,
                Brand = x.Brand,
                Model = x.Model,
                CurrentStock = x.StockBalances.Sum(b => b.CurrentQuantity),
                AvailableStock = x.StockBalances.Sum(b => b.AvailableQuantity),
                PurchasePrice = x.PurchasePrice,
                SalePrice = x.SalePrice
            })
            .Take(20)
            .ToListAsync();
    }

    private static Expression<Func<StockItem, object>> GetSortExpression(string sortBy)
    {
        return sortBy?.ToLower() switch
        {
            "itemcode" => x => x.ItemCode,
            "name" => x => x.Name,
            "category" => x => x.Category.Name,
            "brand" => x => x.Brand,
            "createdat" => x => x.CreatedAt,
            _ => x => x.Name
        };
    }
    

    public async Task<IEnumerable<StockItemDto>> GetByMaterialNameIdAsync(int materialNameId)
    {
        return await _context.StockItems
            .Include(x => x.Category)
            .Include(x => x.Unit)
            .Include(x => x.MaterialName)
            .Include(x => x.MaterialType)
            .Include(x => x.MaterialQuality)
            .Include(x => x.StockBalances)
            .Where(x => x.MaterialNameId == materialNameId && x.IsActive)
            .Select(x => new StockItemDto
            {
                Id = x.Id,
                ItemCode = x.ItemCode ?? "",
                Name = x.Name ?? "",
                Description = x.Description ?? "",
                CategoryId = x.CategoryId,
                CategoryName = x.Category != null ? x.Category.Name ?? "" : "",
                UnitId = x.UnitId,
                UnitName = x.Unit != null ? x.Unit.Name ?? "" : "",
                MaterialNameId = x.MaterialNameId,
                MaterialNameName = x.MaterialName != null ? x.MaterialName.Name ?? "" : "",
                MaterialNameCode = x.MaterialName != null ? x.MaterialName.Code ?? "" : "",
                MaterialTypeId = x.MaterialTypeId,
                MaterialTypeName = x.MaterialType != null ? x.MaterialType.Name ?? "" : "",
                MaterialTypeCode = x.MaterialType != null ? x.MaterialType.Code ?? "" : "",
                MaterialQualityId = x.MaterialQualityId,
                MaterialQualityName = x.MaterialQuality != null ? x.MaterialQuality.Name ?? "" : "",
                MaterialQualityCode = x.MaterialQuality != null ? x.MaterialQuality.Code ?? "" : "",
                HasLotTracking = x.HasLotTracking,
                MinimumStock = x.MinimumStock,
                MaximumStock = x.MaximumStock,
                ReorderLevel = x.ReorderLevel,
                PurchasePrice = x.PurchasePrice,
                SalePrice = x.SalePrice,
                Currency = x.Currency ?? "",
                Brand = x.Brand ?? "",
                Model = x.Model ?? "",
                IsActive = x.IsActive,
                IsDiscontinued = x.IsDiscontinued,
                IsCriticalItem = x.IsCriticalItem,
                CurrentStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.CurrentQuantity) : 0,
                AvailableStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.AvailableQuantity) : 0,
                ReservedStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.ReservedQuantity) : 0,
                StockStatus = DetermineStockStatusSafe(
                    x.StockBalances != null ? x.StockBalances.Sum(b => b.AvailableQuantity) : 0,
                    x.StockBalances != null ? x.StockBalances.Sum(b => b.CurrentQuantity) : 0,
                    x.MinimumStock,
                    x.MaximumStock)
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<StockItemDto>> GetByMaterialTypeIdAsync(int materialTypeId)
    {
        return await _context.StockItems
            .Include(x => x.Category)
            .Include(x => x.Unit)
            .Include(x => x.MaterialName)
            .Include(x => x.MaterialType)
            .Include(x => x.MaterialQuality)
            .Include(x => x.StockBalances)
            .Where(x => x.MaterialTypeId == materialTypeId && x.IsActive)
            .Select(x => new StockItemDto
            {
                Id = x.Id,
                ItemCode = x.ItemCode ?? "",
                Name = x.Name ?? "",
                Description = x.Description ?? "",
                CategoryId = x.CategoryId,
                CategoryName = x.Category != null ? x.Category.Name ?? "" : "",
                UnitId = x.UnitId,
                UnitName = x.Unit != null ? x.Unit.Name ?? "" : "",
                MaterialNameId = x.MaterialNameId,
                MaterialNameName = x.MaterialName != null ? x.MaterialName.Name ?? "" : "",
                MaterialNameCode = x.MaterialName != null ? x.MaterialName.Code ?? "" : "",
                MaterialTypeId = x.MaterialTypeId,
                MaterialTypeName = x.MaterialType != null ? x.MaterialType.Name ?? "" : "",
                MaterialTypeCode = x.MaterialType != null ? x.MaterialType.Code ?? "" : "",
                MaterialQualityId = x.MaterialQualityId,
                MaterialQualityName = x.MaterialQuality != null ? x.MaterialQuality.Name ?? "" : "",
                MaterialQualityCode = x.MaterialQuality != null ? x.MaterialQuality.Code ?? "" : "",
                HasLotTracking = x.HasLotTracking,
                MinimumStock = x.MinimumStock,
                MaximumStock = x.MaximumStock,
                ReorderLevel = x.ReorderLevel,
                PurchasePrice = x.PurchasePrice,
                SalePrice = x.SalePrice,
                Currency = x.Currency ?? "",
                Brand = x.Brand ?? "",
                Model = x.Model ?? "",
                IsActive = x.IsActive,
                IsDiscontinued = x.IsDiscontinued,
                IsCriticalItem = x.IsCriticalItem,
                CurrentStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.CurrentQuantity) : 0,
                AvailableStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.AvailableQuantity) : 0,
                ReservedStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.ReservedQuantity) : 0,
                StockStatus = DetermineStockStatusSafe(
                    x.StockBalances != null ? x.StockBalances.Sum(b => b.AvailableQuantity) : 0,
                    x.StockBalances != null ? x.StockBalances.Sum(b => b.CurrentQuantity) : 0,
                    x.MinimumStock,
                    x.MaximumStock)
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<StockItemDto>> GetByMaterialQualityIdAsync(int materialQualityId)
    {
        return await _context.StockItems
            .Include(x => x.Category)
            .Include(x => x.Unit)
            .Include(x => x.MaterialName)
            .Include(x => x.MaterialType)
            .Include(x => x.MaterialQuality)
            .Include(x => x.StockBalances)
            .Where(x => x.MaterialQualityId == materialQualityId && x.IsActive)
            .Select(x => new StockItemDto
            {
                Id = x.Id,
                ItemCode = x.ItemCode ?? "",
                Name = x.Name ?? "",
                Description = x.Description ?? "",
                CategoryId = x.CategoryId,
                CategoryName = x.Category != null ? x.Category.Name ?? "" : "",
                UnitId = x.UnitId,
                UnitName = x.Unit != null ? x.Unit.Name ?? "" : "",
                MaterialNameId = x.MaterialNameId,
                MaterialNameName = x.MaterialName != null ? x.MaterialName.Name ?? "" : "",
                MaterialNameCode = x.MaterialName != null ? x.MaterialName.Code ?? "" : "",
                MaterialTypeId = x.MaterialTypeId,
                MaterialTypeName = x.MaterialType != null ? x.MaterialType.Name ?? "" : "",
                MaterialTypeCode = x.MaterialType != null ? x.MaterialType.Code ?? "" : "",
                MaterialQualityId = x.MaterialQualityId,
                MaterialQualityName = x.MaterialQuality != null ? x.MaterialQuality.Name ?? "" : "",
                MaterialQualityCode = x.MaterialQuality != null ? x.MaterialQuality.Code ?? "" : "",
                HasLotTracking = x.HasLotTracking,
                MinimumStock = x.MinimumStock,
                MaximumStock = x.MaximumStock,
                ReorderLevel = x.ReorderLevel,
                PurchasePrice = x.PurchasePrice,
                SalePrice = x.SalePrice,
                Currency = x.Currency ?? "",
                Brand = x.Brand ?? "",
                Model = x.Model ?? "",
                IsActive = x.IsActive,
                IsDiscontinued = x.IsDiscontinued,
                IsCriticalItem = x.IsCriticalItem,
                CurrentStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.CurrentQuantity) : 0,
                AvailableStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.AvailableQuantity) : 0,
                ReservedStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.ReservedQuantity) : 0,
                StockStatus = DetermineStockStatusSafe(
                    x.StockBalances != null ? x.StockBalances.Sum(b => b.AvailableQuantity) : 0,
                    x.StockBalances != null ? x.StockBalances.Sum(b => b.CurrentQuantity) : 0,
                    x.MinimumStock,
                    x.MaximumStock)
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<StockItemDto>> GetLotTrackingItemsAsync()
    {
        return await _context.StockItems
            .Include(x => x.Category)
            .Include(x => x.Unit)
            .Include(x => x.MaterialName)
            .Include(x => x.MaterialType)
            .Include(x => x.MaterialQuality)
            .Include(x => x.StockBalances)
            .Where(x => x.HasLotTracking && x.IsActive)
            .Select(x => new StockItemDto
            {
                Id = x.Id,
                ItemCode = x.ItemCode ?? "",
                Name = x.Name ?? "",
                Description = x.Description ?? "",
                CategoryId = x.CategoryId,
                CategoryName = x.Category != null ? x.Category.Name ?? "" : "",
                UnitId = x.UnitId,
                UnitName = x.Unit != null ? x.Unit.Name ?? "" : "",
                MaterialNameId = x.MaterialNameId,
                MaterialNameName = x.MaterialName != null ? x.MaterialName.Name ?? "" : "",
                MaterialNameCode = x.MaterialName != null ? x.MaterialName.Code ?? "" : "",
                MaterialTypeId = x.MaterialTypeId,
                MaterialTypeName = x.MaterialType != null ? x.MaterialType.Name ?? "" : "",
                MaterialTypeCode = x.MaterialType != null ? x.MaterialType.Code ?? "" : "",
                MaterialQualityId = x.MaterialQualityId,
                MaterialQualityName = x.MaterialQuality != null ? x.MaterialQuality.Name ?? "" : "",
                MaterialQualityCode = x.MaterialQuality != null ? x.MaterialQuality.Code ?? "" : "",
                HasLotTracking = x.HasLotTracking,
                MinimumStock = x.MinimumStock,
                MaximumStock = x.MaximumStock,
                ReorderLevel = x.ReorderLevel,
                PurchasePrice = x.PurchasePrice,
                SalePrice = x.SalePrice,
                Currency = x.Currency ?? "",
                Brand = x.Brand ?? "",
                Model = x.Model ?? "",
                IsActive = x.IsActive,
                IsDiscontinued = x.IsDiscontinued,
                IsCriticalItem = x.IsCriticalItem,
                CurrentStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.CurrentQuantity) : 0,
                AvailableStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.AvailableQuantity) : 0,
                ReservedStock = x.StockBalances != null ? x.StockBalances.Sum(b => b.ReservedQuantity) : 0,
                StockStatus = DetermineStockStatusSafe(
                    x.StockBalances != null ? x.StockBalances.Sum(b => b.AvailableQuantity) : 0,
                    x.StockBalances != null ? x.StockBalances.Sum(b => b.CurrentQuantity) : 0,
                    x.MinimumStock,
                    x.MaximumStock)
            })
            .ToListAsync();
    }
    }
