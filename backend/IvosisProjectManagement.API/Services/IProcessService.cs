using IvosisProjectManagement.API.Models;

namespace IvosisProjectManagement.API.Services
{
    public interface IProcessService
    {
        Task<IEnumerable<Process>> GetAllAsync();
        Task<Process?> GetByIdAsync(int id);
        Task<Process> CreateAsync(Process process);
        Task<bool> UpdateAsync(Process process);
        Task<bool> DeleteAsync(int id);
    }
}
