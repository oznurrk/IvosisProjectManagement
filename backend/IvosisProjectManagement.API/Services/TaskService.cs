using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.DTOs;
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
                    Status = t.Status,
                    StartDate = t.StartDate,
                    EndDate = t.EndDate,
                    AssignedUserId = t.AssignedUserId
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
                Status = task.Status,
                StartDate = task.StartDate,
                EndDate = task.EndDate,
                AssignedUserId = task.AssignedUserId
            };
        }

        public async Task<TaskItemDto> CreateAsync(TaskItemCreateDto dto)
        {
            var task = new TaskItem
            {
                ProcessId = dto.ProcessId,
                Title = dto.Title,
                Description = dto.Description,
                Status = dto.Status,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                AssignedUserId = dto.AssignedUserId
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return new TaskItemDto
            {
                Id = task.Id,
                ProcessId = task.ProcessId,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                StartDate = task.StartDate,
                EndDate = task.EndDate,
                AssignedUserId = task.AssignedUserId
            };
        }

        public async Task<bool> UpdateAsync(int id, TaskItemUpdateDto dto)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return false;

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.Status = dto.Status;
            task.StartDate = dto.StartDate;
            task.EndDate = dto.EndDate;
            task.AssignedUserId = dto.AssignedUserId;

            _context.Tasks.Update(task);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return false;

            _context.Tasks.Remove(task);
            return await _context.SaveChangesAsync() > 0;
        }

        Task<IEnumerable<TaskItemDto>> ITaskService.GetAllAsync()
        {
            throw new NotImplementedException();
        }

        Task<TaskItemDto?> ITaskService.GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        Task<TaskItemDto> ITaskService.CreateAsync(TaskItemCreateDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
