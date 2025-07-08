using IvosisProjectManagement.API.Data;
using Microsoft.EntityFrameworkCore;

public class CityService
{
    private readonly ApplicationDbContext _context;

    public CityService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CityDto>> GetAllAsync()
    {
        return await _context.Cities
            .Select(c => new CityDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToListAsync();
    }

    public async Task<CityDto?> GetByIdAsync(int id)
    {
        var city = await _context.Cities.FindAsync(id);
        if (city == null) return null;

        return new CityDto
        {
            Id = city.Id,
            Name = city.Name
        };
    }

    public async Task<CityDto> CreateAsync(CityDto dto)
    {
        var entity = new City
        {
            Name = dto.Name
        };

        _context.Cities.Add(entity);
        await _context.SaveChangesAsync();

        dto.Id = entity.Id;
        return dto;
    }

    public async Task<bool> UpdateAsync(int id, CityDto dto)
    {
        var entity = await _context.Cities.FindAsync(id);
        if (entity == null) return false;

        entity.Name = dto.Name;
        _context.Cities.Update(entity);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.Cities.FindAsync(id);
        if (entity == null) return false;

        _context.Cities.Remove(entity);
        return await _context.SaveChangesAsync() > 0;
    }
}
