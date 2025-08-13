using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.DTOs;
using Microsoft.EntityFrameworkCore;

public class ProjectAddressService : IProjectAddressService
{
    private readonly ApplicationDbContext _context;

    public ProjectAddressService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProjectAddressDto>> GetByProjectIdAsync(int projectId)
    {
    return await _context.ProjectAddresses
        .Where(pa => pa.ProjectId == projectId)
        .Include(pa => pa.City)
        .Include(pa => pa.District)
        .Include(pa => pa.Neighborhood)
        .Select(pa => new ProjectAddressDto
        {
            Id = pa.Id,
            CityId = pa.CityId,
            CityName = pa.City.Name,
            DistrictId = pa.DistrictId,
            DistrictName = pa.District.Name,
            NeighborhoodId = pa.NeighborhoodId,
            NeighborhoodName = pa.Neighborhood != null ? pa.Neighborhood.Name : null,
            Ada = pa.Ada,
            Parsel = pa.Parsel,
            AdressDetails = pa.AdressDetails
        })
        .ToListAsync();
}

    Task<List<ProjectAddressDto>> IProjectAddressService.GetByProjectIdAsync(int projectId)
    {
        throw new NotImplementedException();
    }
}
