using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace IvosisProjectManagement.API.Services
{
    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _context;

        public TaskService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TaskItemDto>> GetAllAsync()
        {
            return await _context.Tasks
                .Select(t => new TaskItemDto
                {
                    Id = t.Id,
                    ProcessId = t.ProcessId,
                    Title = t.Title,
                    Description = t.Description,
                    CreatedAt = t.CreatedAt,
                    CreatedByUserId = t.CreatedBy,
                    UpdatedAt = t.UpdatedAt,
                    UpdatedByUserId = t.UpdatedBy
                })
                .ToListAsync();
        }

        public async Task<TaskItemDto?> GetByIdAsync(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return null;

            return new TaskItemDto
            {
                Id = task.Id,
                ProcessId = task.ProcessId,
                Title = task.Title,
                Description = task.Description,
                CreatedAt = task.CreatedAt,
                CreatedByUserId = task.CreatedBy,
                UpdatedAt = task.UpdatedAt,
                UpdatedByUserId = task.UpdatedBy
            };
        }

        public async Task<IEnumerable<TaskItemDto>> GetTasksByProcessIdAsync(int processId)
        {
            var tasks = await _context.Tasks
                .Where(t => t.ProcessId == processId)
                .Select(t => new TaskItemDto
                {
                    Id = t.Id,
                    ProcessId = t.ProcessId,
                    Title = t.Title,
                    Description = t.Description,
                    CreatedAt = t.CreatedAt,
                    CreatedByUserId = t.CreatedBy,
                    UpdatedAt = t.UpdatedAt,
                    UpdatedByUserId = t.UpdatedBy
                })
                .ToListAsync();

            return tasks;
        }

        public async Task<TaskItemDto> CreateAsync(TaskItemCreateDto dto)
        {
            var task = new TaskItem
            {
                ProcessId = dto.ProcessId,
                Title = dto.Title,
                Description = dto.Description,
                CreatedAt = DateTime.Now,
                CreatedBy = dto.CreatedByUserId
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return new TaskItemDto
            {
                Id = task.Id,
                ProcessId = task.ProcessId,
                Title = task.Title,
                Description = task.Description,
                CreatedAt = task.CreatedAt,
                CreatedByUserId = task.CreatedBy
            };
        }

        public async Task<bool> UpdateAsync(int id, TaskItemUpdateDto dto)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return false;

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.UpdatedAt = DateTime.Now;
            task.UpdatedBy = dto.UpdatedByUserId;

            _context.Tasks.Update(task);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return false;

            _context.Tasks.Remove(task);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}