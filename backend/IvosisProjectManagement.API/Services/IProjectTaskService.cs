using IvosisProjectManagement.API.DTOs;

namespace IvosisProjectManagement.API.Services
{
    public interface IProjectTaskService
    {
        Task<IEnumerable<ProjectTaskDto>> GetAllAsync();
        Task<ProjectTaskDto?> GetByIdAsync(int id);
        Task<ProjectTaskDto> CreateAsync(ProjectTaskCreateDto dto);
        Task<bool> UpdateAsync(int id, ProjectTaskUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
