using IvosisProjectManagement.API.Models;

namespace IvosisProjectManagement.API.Services
{
    public interface IProcessService
    {
        Task<IEnumerable<ProcessDto>> GetAllAsync();
        Task<ProcessDto?> GetByIdAsync(int id);
        Task<ProcessDto> CreateAsync(ProcessCreateDto dto);
        Task<bool> UpdateAsync(int id, ProcessUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}