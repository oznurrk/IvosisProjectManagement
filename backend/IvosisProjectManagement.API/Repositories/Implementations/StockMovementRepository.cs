using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.DTOs;
using Microsoft.EntityFrameworkCore;

public class StockMovementRepository : BaseRepository<StockMovement>, IStockMovementRepository
    {
        public StockMovementRepository(ApplicationDbContext context) : base(context) { }

        public async Task<(IEnumerable<StockMovementDto> Movements, int TotalCount)> GetFilteredAsync(StockMovementFilterDto filter)
        {
            var query = _context.StockMovements
                .Include(x => x.StockItem)
                    .ThenInclude(x => x.Category)
                .Include(x => x.Location)
                .Include(x => x.CreatedByUser)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(filter.Search))
            {
                query = query.Where(x => x.StockItem.Name.Contains(filter.Search) || 
                                        x.StockItem.ItemCode.Contains(filter.Search) ||
                                        x.ReferenceNumber.Contains(filter.Search));
            }

            if (filter.StockItemId.HasValue)
            {
                query = query.Where(x => x.StockItemId == filter.StockItemId.Value);
            }

            if (filter.LocationId.HasValue)
            {
                query = query.Where(x => x.LocationId == filter.LocationId.Value);
            }

            if (!string.IsNullOrEmpty(filter.MovementType))
            {
                query = query.Where(x => x.MovementType == filter.MovementType);
            }

            if (!string.IsNullOrEmpty(filter.ReferenceType))
            {
                query = query.Where(x => x.ReferenceType == filter.ReferenceType);
            }

            if (filter.DateFrom.HasValue)
            {
                query = query.Where(x => x.MovementDate >= filter.DateFrom.Value);
            }

            if (filter.DateTo.HasValue)
            {
                query = query.Where(x => x.MovementDate <= filter.DateTo.Value);
            }

            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortDirection.ToUpper() == "ASC" 
                ? query.OrderBy(x => x.MovementDate)
                : query.OrderByDescending(x => x.MovementDate);

            // Apply pagination
            query = query.Skip((filter.Page - 1) * filter.PageSize)
                         .Take(filter.PageSize);

            var movements = await query.Select(x => new StockMovementDto
            {
                Id = x.Id,
                StockItemId = x.StockItemId,
                ItemCode = x.StockItem.ItemCode,
                ItemName = x.StockItem.Name,
                LocationId = x.LocationId,
                LocationName = x.Location.Name,
                MovementType = x.MovementType,
                Quantity = x.Quantity,
                UnitPrice = x.UnitPrice,
                TotalAmount = x.TotalAmount,
                ReferenceType = x.ReferenceType,
                ReferenceId = x.ReferenceId,
                ReferenceNumber = x.ReferenceNumber,
                Description = x.Description,
                Notes = x.Notes,
                MovementDate = x.MovementDate,
                CategoryName = x.StockItem.Category.Name,
                CreatedAt = x.CreatedAt,
                CreatedBy = x.CreatedBy ?? 0,
                CreatedByName = x.CreatedByUser.Name
            }).ToListAsync();

            return (movements, totalCount);
        }

        public async Task<IEnumerable<StockMovementDto>> GetByStockItemAsync(int stockItemId, int take = 10)
        {
            return await _context.StockMovements
                .Include(x => x.StockItem)
                .Include(x => x.Location)
                .Include(x => x.CreatedByUser)
                .Where(x => x.StockItemId == stockItemId)
                .OrderByDescending(x => x.MovementDate)
                .Take(take)
                .Select(x => new StockMovementDto
                {
                    Id = x.Id,
                    MovementType = x.MovementType,
                    Quantity = x.Quantity,
                    UnitPrice = x.UnitPrice,
                    TotalAmount = x.TotalAmount,
                    LocationName = x.Location.Name,
                    MovementDate = x.MovementDate,
                    Description = x.Description,
                    CreatedByName = x.CreatedByUser.Name
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<StockMovementDto>> GetByLocationAsync(int locationId, int take = 10)
        {
            return await _context.StockMovements
                .Include(x => x.StockItem)
                .Include(x => x.Location)
                .Include(x => x.CreatedByUser)
                .Where(x => x.LocationId == locationId)
                .OrderByDescending(x => x.MovementDate)
                .Take(take)
                .Select(x => new StockMovementDto
                {
                    Id = x.Id,
                    ItemCode = x.StockItem.ItemCode,
                    ItemName = x.StockItem.Name,
                    MovementType = x.MovementType,
                    Quantity = x.Quantity,
                    UnitPrice = x.UnitPrice,
                    TotalAmount = x.TotalAmount,
                    MovementDate = x.MovementDate,
                    Description = x.Description,
                    CreatedByName = x.CreatedByUser.Name
                })
                .ToListAsync();
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

        public async Task<decimal> GetMonthlyTurnoverAsync(DateTime? month = null)
        {
            var targetMonth = month ?? DateTime.Now;
            var startOfMonth = new DateTime(targetMonth.Year, targetMonth.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

            return await _context.StockMovements
                .Where(x => x.MovementDate >= startOfMonth && x.MovementDate <= endOfMonth)
                .Where(x => x.MovementType == "OUT") // Only outgoing movements for turnover
                .SumAsync(x => x.TotalAmount);
        }

        public async Task<StockMovement> CreateMovementAsync(CreateStockMovementDto dto, int userId)
        {
            var movement = new StockMovement
            {
                StockItemId = dto.StockItemId,
                LocationId = dto.LocationId,
                MovementType = dto.MovementType,
                Quantity = dto.Quantity,
                UnitPrice = dto.UnitPrice,
                TotalAmount = dto.Quantity * dto.UnitPrice,
                ReferenceType = dto.ReferenceType,
                ReferenceId = dto.ReferenceId,
                ReferenceNumber = dto.ReferenceNumber,
                Description = dto.Description,
                Notes = dto.Notes,
                MovementDate = dto.MovementDate ?? DateTime.Now,
                CreatedBy = userId,
                CreatedAt = DateTime.Now
            };

            await _context.StockMovements.AddAsync(movement);
            await _context.SaveChangesAsync();
            
            return movement;
        }
    }