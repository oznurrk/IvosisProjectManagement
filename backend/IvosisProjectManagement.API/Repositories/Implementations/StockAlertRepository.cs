using Microsoft.EntityFrameworkCore;
using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Models;
using IvosisProjectManagement.API.DTOs;

namespace IvosisProjectManagement.API.Repositories.Implementations
{
    public class StockAlertRepository : BaseRepository<StockAlert>, IStockAlertRepository
    {
        public StockAlertRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<StockAlertDto>> GetActiveAlertsAsync()
        {
            return await _context.StockAlerts
                .Include(x => x.StockItem)
                .Include(x => x.Location)
                .Where(x => x.IsActive && !x.IsRead)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new StockAlertDto
                {
                    Id = x.Id,
                    StockItemId = x.StockItemId,
                    ItemCode = x.StockItem.ItemCode,
                    ItemName = x.StockItem.Name,
                    LocationId = x.LocationId,
                    LocationName = x.Location.Name,
                    AlertType = x.AlertType,
                    AlertLevel = x.AlertLevel,
                    Message = x.Message,
                    IsRead = x.IsRead,
                    IsActive = x.IsActive,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<StockAlertDto>> GetByStockItemAsync(int stockItemId)
        {
            return await _context.StockAlerts
                .Include(x => x.StockItem)
                .Include(x => x.Location)
                .Where(x => x.StockItemId == stockItemId && x.IsActive)
                .Select(x => new StockAlertDto
                {
                    Id = x.Id,
                    AlertType = x.AlertType,
                    AlertLevel = x.AlertLevel,
                    Message = x.Message,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<StockAlertDto>> GetByLocationAsync(int locationId)
        {
            return await _context.StockAlerts
                .Include(x => x.StockItem)
                .Where(x => x.LocationId == locationId && x.IsActive)
                .Select(x => new StockAlertDto
                {
                    Id = x.Id,
                    ItemName = x.StockItem.Name,
                    AlertType = x.AlertType,
                    AlertLevel = x.AlertLevel,
                    Message = x.Message,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<int> GetActiveAlertCountAsync()
        {
            return await _context.StockAlerts
                .Where(x => x.IsActive && !x.IsRead)
                .CountAsync();
        }

        public async Task MarkAsReadAsync(int alertId, int userId)
        {
            var alert = await _context.StockAlerts.FindAsync(alertId);
            if (alert != null)
            {
                alert.IsRead = true;
                alert.ReadAt = DateTime.Now;
                alert.ReadBy = userId;
                await _context.SaveChangesAsync();
            }
        }

        public async Task CheckAndCreateAlertsAsync()
        {
            // Bu method stok seviyelerini kontrol edip otomatik uyarı oluşturur
            // Şimdilik basit bir implementasyon
            await Task.CompletedTask;
        }

        public async Task CreateAlertAsync(int stockItemId, int locationId, string alertType, string alertLevel, string message)
        {
            var alert = new StockAlert
            {
                StockItemId = stockItemId,
                LocationId = locationId,
                AlertType = alertType,
                AlertLevel = alertLevel,
                Message = message,
                IsRead = false,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            await _context.StockAlerts.AddAsync(alert);
            await _context.SaveChangesAsync();
        }
    }
}