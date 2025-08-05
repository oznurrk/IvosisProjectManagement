using IvosisProjectManagement.API.Data;
using Microsoft.EntityFrameworkCore;

public class StockLocationService : IStockLocationService
{
    private readonly ApplicationDbContext _context;

    public StockLocationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<StockLocationDto>> GetAllAsync()
    {
        return await _context.StockLocations
            .Select(x => new StockLocationDto
            {
                Id = x.Id,
                Name = x.Name,
                Code = x.Code,
                Address = x.Address,
                City = x.City,
                District = x.District,
                PostalCode = x.PostalCode,
                ContactPerson = x.ContactPerson,
                ContactPhone = x.ContactPhone,
                ContactEmail = x.ContactEmail,
                Capacity = x.Capacity,
                CapacityUnit = x.CapacityUnit,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                CreatedByUserId = x.CreatedByUserId,
                ItemCount = x.StockBalances.Count(),
                TotalValue = x.StockBalances.Sum(sb => sb.CurrentQuantity)
            })
            .ToListAsync();
    }

    public async Task<StockLocationDto?> GetByIdAsync(int id)
    {
        var x = await _context.StockLocations
            .Include(s => s.StockBalances)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (x == null) return null;

        return new StockLocationDto
        {
            Id = x.Id,
            Name = x.Name,
            Code = x.Code,
            Address = x.Address,
            City = x.City,
            District = x.District,
            PostalCode = x.PostalCode,
            ContactPerson = x.ContactPerson,
            ContactPhone = x.ContactPhone,
            ContactEmail = x.ContactEmail,
            Capacity = x.Capacity,
            CapacityUnit = x.CapacityUnit,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            CreatedByUserId = x.CreatedByUserId,
            ItemCount = x.StockBalances.Count(),
            TotalValue = x.StockBalances.Sum(sb => sb.CurrentQuantity)
        };
    }

    public async Task<StockLocationDto> CreateAsync(StockLocation entity)
    {
        entity.CreatedAt = DateTime.UtcNow;
        _context.StockLocations.Add(entity);
        await _context.SaveChangesAsync();

        return new StockLocationDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Code = entity.Code,
            Address = entity.Address,
            City = entity.City,
            District = entity.District,
            PostalCode = entity.PostalCode,
            ContactPerson = entity.ContactPerson,
            ContactPhone = entity.ContactPhone,
            ContactEmail = entity.ContactEmail,
            Capacity = entity.Capacity,
            CapacityUnit = entity.CapacityUnit,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            CreatedByUserId = entity.CreatedByUserId,
            ItemCount = 0,
            TotalValue = 0
        };
    }

    public async Task<bool> UpdateAsync(int id, StockLocation entity)
    {
        var existing = await _context.StockLocations.FindAsync(id);
        if (existing == null) return false;

        existing.Name = entity.Name;
        existing.Code = entity.Code;
        existing.Address = entity.Address;
        existing.City = entity.City;
        existing.District = entity.District;
        existing.PostalCode = entity.PostalCode;
        existing.ContactPerson = entity.ContactPerson;
        existing.ContactPhone = entity.ContactPhone;
        existing.ContactEmail = entity.ContactEmail;
        existing.Capacity = entity.Capacity;
        existing.CapacityUnit = entity.CapacityUnit;
        existing.IsActive = entity.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;
        existing.UpdatedByUserId = entity.UpdatedByUserId;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _context.StockLocations.FindAsync(id);
        if (existing == null) return false;

        _context.StockLocations.Remove(existing);
        await _context.SaveChangesAsync();
        return true;
    }
}
