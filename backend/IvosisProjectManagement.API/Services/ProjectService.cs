using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace IvosisProjectManagement.API.Services
{
    public class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _context;

        public ProjectService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Project?> GetByIdAsync(int id) =>
            await _context.Projects
                    .Include(p => p.Tasks)
                    .ThenInclude(t => t.AssignedUser)
                    .FirstOrDefaultAsync(p => p.Id == id);

        public async Task<List<Project>> GetAllAsync() =>
            await _context.Projects
                          .Include(p => p.Tasks)
                          .ToListAsync();

        public async Task<Project> CreateAsync(Project project)
        {
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            return project;
        }

        public async Task<bool> UpdateAsync(Project project)
        {
            if (!await _context.Projects.AnyAsync(p => p.Id == project.Id))
                return false;

            _context.Projects.Update(project);
             return await _context.SaveChangesAsync()>0;
        }
        
        public async Task<bool> DeleteAsync(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return false;

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return true;
        }

      

    }
}
