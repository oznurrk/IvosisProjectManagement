using IvosisProjectManagement.API.Models;

public interface ISupplierRepository : IBaseRepository<Supplier>
    {
        Task<bool> IsTaxNumberUniqueAsync(string taxNumber, int? excludeId = null);
    }