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
        public async Task<List<Supplier>> SearchSuppliersAsync(string searchTerm, int? companyId = null)
        {
            var query = _context.Suppliers
                .Include(s => s.CreatedByUser)
                .Include(s => s.UpdatedByUser)
                .Include(s => s.Company)
                .AsQueryable();

            if (companyId.HasValue)
            {
                query = query.Where(s => s.CompanyId == companyId.Value);
            }

            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(s =>
                    s.CompanyName.ToLower().Contains(searchTerm) ||
                    s.TaxNumber.Contains(searchTerm) ||
                    s.ContactPerson.ToLower().Contains(searchTerm) ||
                    s.ContactPhone.Contains(searchTerm) ||
                    s.ContactEmail.ToLower().Contains(searchTerm));
            }

            return await query.OrderBy(s => s.CompanyName).ToListAsync();
        }

        public async Task<List<Supplier>> GetActiveSuppliersByCompanyAsync(int companyId)
        {
            return await _context.Suppliers
                .Include(s => s.CreatedByUser)
                .Include(s => s.UpdatedByUser)
                .Where(s => s.IsActive && s.CompanyId == companyId)
                .OrderBy(s => s.CompanyName)
                .ToListAsync();
        }

        public async Task<bool> HasRelatedDataAsync(int supplierId)
        {
            var hasStockLots = await _context.StockLots.AnyAsync(sl => sl.SupplierId == supplierId);
            var hasDemandItems = await _context.DemandItems.AnyAsync(di => di.SuggestedSupplierId == supplierId);

            return hasStockLots || hasDemandItems;
        }
    }
}