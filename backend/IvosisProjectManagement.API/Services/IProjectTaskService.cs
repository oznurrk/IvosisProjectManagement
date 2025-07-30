using IvosisProjectManagement.API.DTOs;

namespace IvosisProjectManagement.API.Services
{
    public interface IProjectTaskService
    {
        Task<IEnumerable<ProjectTaskDto>> GetAllAsync();
        Task<ProjectTaskDto?> GetByIdAsync(int id);
        Task<List<ProjectTaskDto>> GetTasksByUserIdAsync(int userId);
        Task<ProjectTaskDto> CreateAsync(ProjectTaskCreateDto dto);
        Task<bool> UpdateAsync(int id, ProjectTaskUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<ProjectTaskDto>> GetTasksByProjectIdAsync(int projectId);
        Task<IEnumerable<ProjectTaskDto>> CreateManyAsync(List<ProjectTaskCreateDto> dtos);
        
        // Dosya işlemleri için yeni metodlar
        Task<byte[]> GetTaskFileAsync(int taskId, string fileName);
        Task<Stream> GetTaskFileStreamAsync(int taskId, string fileName);
        Task<bool> TaskFileExistsAsync(int taskId, string fileName);
        Task<string> GetTaskFilePathAsync(int taskId, string fileName);
    }
}