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
        var units = await _context.Units.AsNoTracking().ToListAsync();
        return _mapper.Map<List<UnitDto>>(units);
    }

    public async Task<UnitDto?> GetByIdAsync(int id)
    {
        var unit = await _context.Units.FindAsync(id);
        return unit == null ? null : _mapper.Map<UnitDto>(unit);
    }

    public async Task<UnitDto> CreateAsync(UnitCreateDto dto)
    {
        var unit = _mapper.Map<Unit>(dto);
        _context.Units.Add(unit);
        await _context.SaveChangesAsync();
        return _mapper.Map<UnitDto>(unit);
    }

    public async Task<bool> UpdateAsync(int id, UnitUpdateDto dto)
    {
        var unit = await _context.Units.FindAsync(id);
        if (unit == null)
            return false;

        _mapper.Map(dto, unit);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var unit = await _context.Units.FindAsync(id);
        if (unit == null)
            return false;

        _context.Units.Remove(unit);
        await _context.SaveChangesAsync();
        return true;
    }
}
