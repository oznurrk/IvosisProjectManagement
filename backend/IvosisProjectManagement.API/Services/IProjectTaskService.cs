using IvosisProjectManagement.API.Models;

namespace IvosisProjectManagement.API.Services
{
    public interface IProjectTaskService
    {
        Task<IEnumerable<ProjectTask>> GetAllAsync();
        Task<ProjectTask?> GetByIdAsync(int id);
        Task<ProjectTask> CreateAsync(ProjectTask task);
        Task<bool> UpdateAsync(ProjectTask task);
        Task<bool> DeleteAsync(int id);
    }
}
