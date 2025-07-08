using IvosisProjectManagement.API.Data;
using Microsoft.EntityFrameworkCore;

public class NeighborhoodService
{
    private readonly ApplicationDbContext _context;

    public NeighborhoodService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<NeighborhoodDto>> GetAllAsync()
    {
        return await _context.Neighborhoods
            .Select(n => new NeighborhoodDto
            {
                Id = n.Id,
                Name = n.Name,
                DistrictId = n.DistrictId
            })
            .ToListAsync();
    }

    public async Task<NeighborhoodDto?> GetByIdAsync(int id)
    {
        var n = await _context.Neighborhoods.FindAsync(id);
        if (n == null) return null;

        return new NeighborhoodDto
        {
            Id = n.Id,
            Name = n.Name,
            DistrictId = n.DistrictId
        };
    }

    public async Task<NeighborhoodDto> CreateAsync(NeighborhoodDto dto)
    {
        var entity = new Neighborhood
        {
            Name = dto.Name,
            DistrictId = dto.DistrictId
        };

        _context.Neighborhoods.Add(entity);
        await _context.SaveChangesAsync();

        dto.Id = entity.Id;
        return dto;
    }

    public async Task<bool> UpdateAsync(int id, NeighborhoodDto dto)
    {
        var entity = await _context.Neighborhoods.FindAsync(id);
        if (entity == null) return false;

        entity.Name = dto.Name;
        entity.DistrictId = dto.DistrictId;
        _context.Neighborhoods.Update(entity);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.Neighborhoods.FindAsync(id);
        if (entity == null) return false;

        _context.Neighborhoods.Remove(entity);
        return await _context.SaveChangesAsync() > 0;
    }
}
