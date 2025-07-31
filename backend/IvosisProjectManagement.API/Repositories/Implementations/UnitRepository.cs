using Microsoft.EntityFrameworkCore;
using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Models;

namespace IvosisProjectManagement.API.Repositories.Implementations
{
    public class UnitRepository : BaseRepository<Unit>, IUnitRepository
    {
        public UnitRepository(ApplicationDbContext context) : base(context) { }

        public async Task<bool> IsUnitCodeUniqueAsync(string code, int? excludeId = null)
        {
            var query = _context.Units.Where(x => x.Code == code);
            if (excludeId.HasValue)
                query = query.Where(x => x.Id != excludeId.Value);
            return !await query.AnyAsync();
        }

        public async Task<bool> IsUsedInItemsAsync(int unitId)
        {
            return await _context.StockItems.AnyAsync(x => x.UnitId == unitId);
        }
    }
}