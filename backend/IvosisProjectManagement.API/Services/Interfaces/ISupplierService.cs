using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.DTOs.Common;

namespace IvosisProjectManagement.API.Services.Interfaces
{
    public interface ISupplierService
    {
        Task<Result<List<SupplierDto>>> GetAllAsync(int? companyId);
        Task<Result<SupplierDto>> GetByIdAsync(int id, int? companyId);
        Task<Result<SupplierDto>> CreateAsync(SupplierCreateDto createDto, int userId, int? companyId);
        Task<Result<SupplierDto>> UpdateAsync(int id, SupplierUpdateDto updateDto, int userId, int? companyId);
        Task<Result<bool>> DeleteAsync(int id, int? companyId);
        Task<Result<List<SupplierListDto>>> GetListAsync(int? companyId);
        Task<Result<bool>> ToggleStatusAsync(int id, int userId, int? companyId);

        // SupplierCompany operations
        Task<Result<List<SupplierCompanyDto>>> GetSupplierCompaniesBySupplierIdAsync(int supplierId, int? companyId);
        Task<Result<SupplierCompanyDto>> AddSupplierCompanyAsync(SupplierCompanyCreateDto createDto, int userId);
        Task<Result<bool>> RemoveSupplierCompanyAsync(int supplierId, int companyId, int userId);
        
        Task<Result<List<SupplierDto>>> SearchSuppliersAsync(string searchTerm, int? companyId);
        Task<Result<List<SupplierDto>>> GetActiveSuppliersByCompanyAsync(int companyId);
        Task<Result<bool>> ValidateTaxNumberAsync(string taxNumber, int? excludeId = null);
        Task<Result<Dictionary<string, object>>> GetSupplierStatisticsAsync(int? companyId);
    }
}
