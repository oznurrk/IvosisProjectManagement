// UnitService.cs - BaseEntity uyumlu, UserId controller'dan alınacak
using AutoMapper;
using IvosisProjectManagement.API.Data;
using Microsoft.EntityFrameworkCore;

public class UnitService : IUnitService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UnitService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<UnitDto>> GetAllAsync()
    {
        var units = await _context.Units
            .Include(u => u.CreatedByUser)
            .AsNoTracking()
            .Where(u => u.IsActive)
            .OrderBy(u => u.Name)
            .ToListAsync();
            
        return _mapper.Map<List<UnitDto>>(units);
    }

    public async Task<UnitDto?> GetByIdAsync(int id)
    {
        var unit = await _context.Units
            .Include(u => u.CreatedByUser)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);
            
        return unit == null ? null : _mapper.Map<UnitDto>(unit);
    }

    public async Task<UnitDto> CreateAsync(UnitCreateDto dto, int currentUserId)
    {
        var existingUnit = await _context.Units
            .FirstOrDefaultAsync(u => u.Code == dto.Code);
            
        if (existingUnit != null)
            throw new InvalidOperationException($"Bu kod zaten kullanılıyor: {dto.Code}");

        var unit = _mapper.Map<Unit>(dto);
        
        // BaseEntity alanlarını doldur
        unit.CreatedAt = DateTime.Now;
        unit.CreatedBy = currentUserId;
        unit.IsActive = true;

        _context.Units.Add(unit);
        await _context.SaveChangesAsync();
        
        var createdUnit = await _context.Units
            .Include(u => u.CreatedByUser)
            .FirstAsync(u => u.Id == unit.Id);
            
        return _mapper.Map<UnitDto>(createdUnit);
    }

    public async Task<bool> UpdateAsync(int id, UnitUpdateDto dto, int currentUserId)
    {
        var unit = await _context.Units.FindAsync(id);
        if (unit == null) return false;

        var existingUnit = await _context.Units
            .FirstOrDefaultAsync(u => u.Code == dto.Code && u.Id != id);
            
        if (existingUnit != null)
            throw new InvalidOperationException($"Bu kod zaten kullanılıyor: {dto.Code}");

        _mapper.Map(dto, unit);
        
        // BaseEntity alanlarını güncelle
        unit.UpdatedAt = DateTime.Now;
        unit.UpdatedBy = currentUserId; 

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id, int currentUserId)
    {
        var unit = await _context.Units.FindAsync(id);
        if (unit == null) return false;

        var isUsed = await _context.StockItems.AnyAsync(s => s.UnitId == id);
        if (isUsed)
            throw new InvalidOperationException("Bu birim stok kalemlerinde kullanıldığı için silinemez.");

        // Soft delete
        unit.IsActive = false;
        unit.UpdatedAt = DateTime.Now;
        unit.UpdatedBy = currentUserId;

        await _context.SaveChangesAsync();
        return true;
    }

    public Task<UnitDto> CreateAsync(UnitCreateDto dto)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateAsync(int id, UnitUpdateDto dto)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteAsync(int id)
    {
        throw new NotImplementedException();
    }
}