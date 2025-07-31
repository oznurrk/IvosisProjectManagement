using Microsoft.EntityFrameworkCore;
using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Models;

namespace IvosisProjectManagement.API.Repositories.Implementations
{
    public class SupplierRepository : BaseRepository<Supplier>, ISupplierRepository
    {
        public SupplierRepository(ApplicationDbContext context) : base(context) { }

        public async Task<bool> IsTaxNumberUniqueAsync(string taxNumber, int? excludeId = null)
        {
            if (string.IsNullOrEmpty(taxNumber)) return true;
            
            var query = _context.Suppliers.Where(x => x.TaxNumber == taxNumber);
            if (excludeId.HasValue)
                query = query.Where(x => x.Id != excludeId.Value);
            return !await query.AnyAsync();
        }
    }
}