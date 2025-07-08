using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Models;
using Microsoft.EntityFrameworkCore;

public class ProjectTypeService : IProjectTypeService
{
    private readonly ApplicationDbContext _context;

    public ProjectTypeService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProjectType>> GetAllAsync()
    {
        return await _context.ProjectTypes.ToListAsync();
    }

    Task<IEnumerable<ProjectType>> IProjectTypeService.GetAllAsync()
    {
        throw new NotImplementedException();
    }
}
