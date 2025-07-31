using Microsoft.EntityFrameworkCore;
using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Models;
using IvosisProjectManagement.API.DTOs;

namespace IvosisProjectManagement.API.Repositories.Implementations
{
    public class StockBalanceRepository : BaseRepository<StockBalance>, IStockBalanceRepository
    {
        public StockBalanceRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<StockBalanceDto>> GetAllWithDetailsAsync()
        {
            return await _context.StockBalances
                .Include(x => x.StockItem)
                    .ThenInclude(x => x.Category)
                .Include(x => x.StockItem.Unit)
                .Include(x => x.Location)
                .Select(x => new StockBalanceDto
                {
                    StockItemId = x.StockItemId,
                    ItemCode = x.StockItem.ItemCode,
                    ItemName = x.StockItem.Name,
                    LocationId = x.LocationId,
                    LocationName = x.Location.Name,
                    CurrentQuantity = x.CurrentQuantity,
                    ReservedQuantity = x.ReservedQuantity,
                    AvailableQuantity = x.AvailableQuantity,
                    LastMovementDate = x.LastMovementDate,
                    LastUpdateDate = x.LastUpdateDate,
                    CategoryName = x.StockItem.Category.Name,
                    UnitName = x.StockItem.Unit.Name,
                    MinimumStock = x.StockItem.MinimumStock,
                    MaximumStock = x.StockItem.MaximumStock,
                    StockStatus = x.AvailableQuantity <= x.StockItem.MinimumStock ? "LOW_STOCK" :
                                 x.CurrentQuantity >= x.StockItem.MaximumStock ? "OVERSTOCK" : "NORMAL"
                })
                .ToListAsync();
        }

        public async Task<StockBalanceDto> GetByItemAndLocationAsync(int stockItemId, int locationId)
        {
            return await _context.StockBalances
                .Include(x => x.StockItem)
                .Include(x => x.Location)
                .Where(x => x.StockItemId == stockItemId && x.LocationId == locationId)
                .Select(x => new StockBalanceDto
                {
                    StockItemId = x.StockItemId,
                    ItemCode = x.StockItem.ItemCode,
                    ItemName = x.StockItem.Name,
                    LocationId = x.LocationId,
                    LocationName = x.Location.Name,
                    CurrentQuantity = x.CurrentQuantity,
                    ReservedQuantity = x.ReservedQuantity,
                    AvailableQuantity = x.AvailableQuantity
                })
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<StockBalanceDto>> GetByLocationAsync(int locationId)
        {
            return await _context.StockBalances
                .Include(x => x.StockItem)
                .Where(x => x.LocationId == locationId)
                .Select(x => new StockBalanceDto
                {
                    StockItemId = x.StockItemId,
                    ItemCode = x.StockItem.ItemCode,
                    ItemName = x.StockItem.Name,
                    CurrentQuantity = x.CurrentQuantity,
                    AvailableQuantity = x.AvailableQuantity
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<StockBalanceDto>> GetByStockItemAsync(int stockItemId)
        {
            return await _context.StockBalances
                .Include(x => x.Location)
                .Where(x => x.StockItemId == stockItemId)
                .Select(x => new StockBalanceDto
                {
                    LocationId = x.LocationId,
                    LocationName = x.Location.Name,
                    CurrentQuantity = x.CurrentQuantity,
                    AvailableQuantity = x.AvailableQuantity
                })
                .ToListAsync();
        }

        public async Task UpdateBalanceAsync(int stockItemId, int locationId, decimal quantity, string movementType)
        {
            var balance = await _context.StockBalances
                .FirstOrDefaultAsync(x => x.StockItemId == stockItemId && x.LocationId == locationId);

            if (balance == null)
            {
                balance = new StockBalance
                {
                    StockItemId = stockItemId,
                    LocationId = locationId,
                    CurrentQuantity = 0,
                    ReservedQuantity = 0
                };
                await _context.StockBalances.AddAsync(balance);
            }

            if (movementType == "IN" || movementType == "ADJUSTMENT")
            {
                balance.CurrentQuantity += quantity;
            }
            else if (movementType == "OUT")
            {
                balance.CurrentQuantity -= quantity;
            }

            balance.LastMovementDate = DateTime.Now;
            balance.LastUpdateDate = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        public async Task<decimal> GetAvailableStockAsync(int stockItemId, int locationId)
        {
            var balance = await _context.StockBalances
                .FirstOrDefaultAsync(x => x.StockItemId == stockItemId && x.LocationId == locationId);

            return balance?.AvailableQuantity ?? 0;
        }

        public async Task<decimal> GetTotalStockAsync(int stockItemId)
        {
            return await _context.StockBalances
                .Where(x => x.StockItemId == stockItemId)
                .SumAsync(x => x.CurrentQuantity);
        }
    }
}