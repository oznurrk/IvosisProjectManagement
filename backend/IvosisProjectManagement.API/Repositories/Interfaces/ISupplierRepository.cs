using IvosisProjectManagement.API.Models;

public interface ISupplierRepository : IBaseRepository<Supplier>
{
    Task<bool> IsTaxNumberUniqueAsync(string taxNumber, int? excludeId = null);
        Task<List<Supplier>> SearchSuppliersAsync(string searchTerm, int? companyId = null);
        Task<List<Supplier>> GetActiveSuppliersByCompanyAsync(int companyId);
        Task<bool> HasRelatedDataAsync(int supplierId);
    }