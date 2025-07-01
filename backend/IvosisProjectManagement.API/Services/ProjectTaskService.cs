using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.DTOs;
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

        public async Task<IEnumerable<ProjectTaskDto>> GetAllAsync()
        {
            return await _context.ProjectTasks
                .Select(t => new ProjectTaskDto
                {
                    Id = t.Id,
                    ProjectId = t.ProjectId,
                    ProcessId = t.ProcessId,
                    TaskId = t.TaskId,
                    AssignedUserId = t.AssignedUserId,
                    Description = t.Description,
                    FilePath = t.FilePath
                }).ToListAsync();
        }

        public async Task<ProjectTaskDto?> GetByIdAsync(int id)
        {
            var task = await _context.ProjectTasks.FindAsync(id);
            if (task == null) return null;

            return new ProjectTaskDto
            {
                Id = task.Id,
                ProjectId = task.ProjectId,
                ProcessId = task.ProcessId,
                TaskId = task.TaskId,
                AssignedUserId = task.AssignedUserId,
                Description = task.Description,
                FilePath = task.FilePath
            };
        }

        public async Task<ProjectTaskDto> CreateAsync(ProjectTaskCreateDto dto)
        {
            var task = new ProjectTask
            {
                ProjectId = dto.ProjectId,
                ProcessId = dto.ProcessId,
                TaskId = dto.TaskId,
                AssignedUserId = dto.AssignedUserId,
                Description = dto.Description,
                FilePath = dto.FilePath
            };

            _context.ProjectTasks.Add(task);
            await _context.SaveChangesAsync();

            return new ProjectTaskDto
            {
                Id = task.Id,
                ProjectId = task.ProjectId,
                ProcessId = task.ProcessId,
                TaskId = task.TaskId,
                AssignedUserId = task.AssignedUserId,
                Description = task.Description,
                FilePath = task.FilePath
            };
        }

        public async Task<bool> UpdateAsync(ProjectTaskUpdateDto dto)
        {
            var task = await _context.ProjectTasks.FindAsync(dto.Id);
            if (task == null) return false;

            task.ProjectId = dto.ProjectId;
            task.ProcessId = dto.ProcessId;
            task.TaskId = dto.TaskId;
            task.AssignedUserId = dto.AssignedUserId;
            task.Description = dto.Description;
            task.FilePath = dto.FilePath;

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
