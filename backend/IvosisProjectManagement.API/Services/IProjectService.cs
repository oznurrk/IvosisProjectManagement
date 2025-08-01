
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.Models;

namespace IvosisProjectManagement.API.Services
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectDto>> GetAllAsync();
        Task<ProjectDto?> GetByIdAsync(int id);
        Task<ProjectDto> CreateAsync(ProjectCreateDto dto);
        Task<bool> UpdateAsync(int id, ProjectUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<List<ProjectDto>> GetProjectsByCompaniesAsync(List<int> companyIds);
        Task<List<ProjectDto>> GetProjectsByCompanyAsync(int companyId);
        Task<List<ProjectDto>> GetProductionProjectsAsync(int companyId);
        
    }
}