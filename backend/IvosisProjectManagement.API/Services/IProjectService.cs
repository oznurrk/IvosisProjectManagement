
using IvosisProjectManagement.API.DTOs;

namespace IvosisProjectManagement.API.Services
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectDto>> GetAllAsync();
        Task<ProjectDto?> GetByIdAsync(int id);
        Task<ProjectDto> CreateAsync(ProjectCreateDto dto);
        Task<bool> UpdateAsync(int id, ProjectUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}