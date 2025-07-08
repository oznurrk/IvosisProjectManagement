using IvosisProjectManagement.API.Data;
using Microsoft.EntityFrameworkCore;

public class DistrictService
{
    private readonly ApplicationDbContext _context;

    public DistrictService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DistrictDto>> GetAllAsync()
    {
        return await _context.Districts
            .Select(d => new DistrictDto
            {
                Id = d.Id,
                Name = d.Name,
                CityId = d.CityId
            })
            .ToListAsync();
    }

    public async Task<DistrictDto?> GetByIdAsync(int id)
    {
        var district = await _context.Districts.FindAsync(id);
        if (district == null) return null;

        return new DistrictDto
        {
            Id = district.Id,
            Name = district.Name,
            CityId = district.CityId
        };
    }

    public async Task<DistrictDto> CreateAsync(DistrictDto dto)
    {
        var entity = new District
        {
            Name = dto.Name,
            CityId = dto.CityId
        };

        _context.Districts.Add(entity);
        await _context.SaveChangesAsync();

        dto.Id = entity.Id;
        return dto;
    }

    public async Task<bool> UpdateAsync(int id, DistrictDto dto)
    {
        var entity = await _context.Districts.FindAsync(id);
        if (entity == null) return false;

        entity.Name = dto.Name;
        entity.CityId = dto.CityId;
        _context.Districts.Update(entity);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.Districts.FindAsync(id);
        if (entity == null) return false;

        _context.Districts.Remove(entity);
        return await _context.SaveChangesAsync() > 0;
    }
}
