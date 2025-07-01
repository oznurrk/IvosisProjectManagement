using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace IvosisProjectManagement.API.Services
{
    public class ProjectTaskService : IProjectTaskService
    {
        private readonly ApplicationDbContext _context;

        public ProjectTaskService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProjectTask>> GetAllAsync() =>
            await _context.ProjectTasks.Include(t => t.AssignedUser).ToListAsync();

        public async Task<ProjectTask?> GetByIdAsync(int id) =>
            await _context.ProjectTasks.Include(t => t.AssignedUser).FirstOrDefaultAsync(t => t.Id == id);

        public async Task<ProjectTask> CreateAsync(ProjectTask task)
        {
            _context.ProjectTasks.Add(task);
            await _context.SaveChangesAsync();
            return task;
        }

        public async Task<bool> UpdateAsync(ProjectTask task)
        {
            if (!_context.ProjectTasks.Any(t => t.Id == task.Id))
                return false;

            _context.ProjectTasks.Update(task);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var task = await _context.ProjectTasks.FindAsync(id);
            if (task == null) return false;

            _context.ProjectTasks.Remove(task);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
