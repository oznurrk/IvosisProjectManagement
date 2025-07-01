using IvosisProjectManagement.API.DTOs;

namespace IvosisProjectManagement.API.Services
{
    public interface ITaskService
    {
        Task<IEnumerable<TaskItemDto>> GetAllAsync();
        Task<TaskItemDto?> GetByIdAsync(int id);
        Task<TaskItemDto> CreateAsync(TaskItemCreateDto dto);
        Task<bool> UpdateAsync(int id, TaskItemUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
