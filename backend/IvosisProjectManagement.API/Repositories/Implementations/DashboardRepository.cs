using IvosisProjectManagement.API.Data;
using Microsoft.EntityFrameworkCore;

public class DashboardRepository : IDashboardRepository
    {
        private readonly ApplicationDbContext _context;

        public DashboardRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var totalItems = await _context.StockItems.Where(x => x.IsActive).CountAsync();
            
            var lowStockItems = await _context.StockItems
                .Include(x => x.StockBalances)
                .Where(x => x.IsActive && x.StockBalances.Sum(b => b.AvailableQuantity) <= x.MinimumStock)
                .CountAsync();

            var criticalStockItems = await _context.StockItems
                .Include(x => x.StockBalances)
                .Where(x => x.IsActive && x.IsCriticalItem && x.StockBalances.Sum(b => b.AvailableQuantity) <= x.ReorderLevel)
                .CountAsync();

            var totalStockValue = await _context.StockBalances
                .Include(x => x.StockItem)
                .SumAsync(x => x.CurrentQuantity * x.StockItem.PurchasePrice);

            var currentMonth = DateTime.Now;
            var startOfMonth = new DateTime(currentMonth.Year, currentMonth.Month, 1);
            var monthlyTurnover = await _context.StockMovements
                .Where(x => x.MovementDate >= startOfMonth)
                .Where(x => x.MovementType == "OUT")
                .SumAsync(x => x.TotalAmount);

            var activeAlerts = await _context.StockAlerts
                .Where(x => x.IsActive && !x.IsRead)
                .CountAsync();

            var totalLocations = await _context.StockLocations
                .Where(x => x.IsActive)
                .CountAsync();

            var totalCategories = await _context.StockCategories
                .Where(x => x.IsActive)
                .CountAsync();

            return new DashboardStatsDto
            {
                TotalItems = totalItems,
                LowStockItems = lowStockItems,
                CriticalStockItems = criticalStockItems,
                TotalStockValue = totalStockValue,
                MonthlyTurnover = monthlyTurnover,
                ActiveAlerts = activeAlerts,
                TotalLocations = totalLocations,
                TotalCategories = totalCategories
            };
        }

        public async Task<IEnumerable<RecentMovementDto>> GetRecentMovementsAsync(int take = 10)
        {
            return await _context.StockMovements
                .Include(x => x.StockItem)
                .Include(x => x.Location)
                .Include(x => x.CreatedByUser)
                .OrderByDescending(x => x.MovementDate)
                .Take(take)
                .Select(x => new RecentMovementDto
                {
                    Id = x.Id,
                    ItemCode = x.StockItem.ItemCode,
                    ItemName = x.StockItem.Name,
                    MovementType = x.MovementType,
                    Quantity = x.Quantity,
                    LocationName = x.Location.Name,
                    MovementDate = x.MovementDate,
                    CreatedByName = x.CreatedByUser.Name,
                    Description = x.Description
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<StockAlertDto>> GetRecentAlertsAsync(int take = 5)
        {
            return await _context.StockAlerts
                .Include(x => x.StockItem)
                .Include(x => x.Location)
                .Where(x => x.IsActive)
                .OrderByDescending(x => x.CreatedAt)
                .Take(take)
                .Select(x => new StockAlertDto
                {
                    Id = x.Id,
                    ItemCode = x.StockItem.ItemCode,
                    ItemName = x.StockItem.Name,
                    LocationName = x.Location.Name,
                    AlertType = x.AlertType,
                    AlertLevel = x.AlertLevel,
                    Message = x.Message,
                    IsRead = x.IsRead,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();
        }
    }