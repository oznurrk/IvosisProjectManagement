using IvosisProjectManagement.API.DTOs;

namespace IvosisProjectManagement.API.Services.Interfaces
{
    public interface IPersonnelService
    {
        Task<IEnumerable<PersonnelDto>> GetAllPersonnelAsync();
        Task<PersonnelDto?> GetByIdAsync(int id);
        Task<PersonnelDto?> GetBySicilNoAsync(string sicilNo);
        Task<PersonnelDto> CreatePersonnelAsync(PersonnelCreateDto dto);
        Task<bool> UpdateAsync(int id, PersonnelUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<bool> SicilNoExistsAsync(string sicilNo);
        Task<bool> TCKimlikNoExistsAsync(string tcKimlikNo);
        Task<bool> EmailExistsAsync(string email);
        Task<List<PersonnelDto>> GetPersonnelByCompaniesAsync(List<int> companyIds);
        Task<List<PersonnelDto>> GetPersonnelByDepartmentAsync(int departmentId);
    }
}
