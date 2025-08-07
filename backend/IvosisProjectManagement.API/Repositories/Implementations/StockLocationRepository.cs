using Microsoft.EntityFrameworkCore;
using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Models;
using IvosisProjectManagement.API.DTOs;

namespace IvosisProjectManagement.API.Repositories.Implementations
{
    public class StockLocationRepository : BaseRepository<StockLocation>, IStockLocationRepository
    {
        public StockLocationRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<StockLocationDto>> GetAllWithDetailsAsync()
        {
            return await _context.StockLocations
                .Include(x => x.CreatedByUser)
                .Include(x => x.UpdatedByUser)
                .Include(x => x.StockBalances)
                .Select(x => new StockLocationDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Code = x.Code,
                    Address = x.Address ?? "",
                    City = x.City ?? "",
                    District = x.District ?? "",
                    PostalCode = x.PostalCode ?? "",
                    ContactPerson = x.ContactPerson ?? "",
                    ContactPhone = x.ContactPhone ?? "",
                    ContactEmail = x.ContactEmail ?? "",
                    Capacity = x.Capacity,
                    CapacityUnit = x.CapacityUnit ?? "",
                    IsActive = x.IsActive,
                    ItemCount = x.StockBalances.Count,
                    TotalValue = x.StockBalances.Sum(b => b.CurrentQuantity * (b.StockItem != null ? b.StockItem.PurchasePrice : 0)),
                    CreatedAt = x.CreatedAt,
                    CreatedBy = x.CreatedBy ?? 0,
                    CreatedByName = x.CreatedByUser != null ? x.CreatedByUser.Name : ""
                })
                .ToListAsync();
        }

        public async Task<StockLocationDto> GetByIdWithDetailsAsync(int id)
        {
            return await _context.StockLocations
                .Include(x => x.CreatedByUser)
                .Include(x => x.UpdatedByUser)
                .Include(x => x.StockBalances)
                .Where(x => x.Id == id)
                .Select(x => new StockLocationDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Code = x.Code,
                    Address = x.Address ?? "",
                    City = x.City ?? "",
                    District = x.District ?? "",
                    ContactPerson = x.ContactPerson ?? "",
                    IsActive = x.IsActive,
                    ItemCount = x.StockBalances.Count
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> IsLocationCodeUniqueAsync(string code, int? excludeId = null)
        {
            var query = _context.StockLocations.Where(x => x.Code == code);
            if (excludeId.HasValue)
                query = query.Where(x => x.Id != excludeId.Value);
            return !await query.AnyAsync();
        }

        public async Task<bool> HasStockAsync(int locationId)
        {
            return await _context.StockBalances.AnyAsync(x => x.LocationId == locationId && x.CurrentQuantity > 0);
        }
    }
}