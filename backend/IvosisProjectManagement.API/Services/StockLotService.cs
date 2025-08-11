using AutoMapper;
using Microsoft.EntityFrameworkCore;
using IvosisProjectManagement.API.DTOs.Common;
using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Services.Interfaces;
using System.Linq.Expressions;

namespace IvosisProjectManagement.API.Services
{
    public class StockLotService : IStockLotService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<StockLotService> _logger;

        public StockLotService(
            ApplicationDbContext context, 
            IMapper mapper, 
            ILogger<StockLotService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<Result<StockLotResponseDto>> GetByIdAsync(int id)
        {
            try
            {
                var stockLot = await _context.StockLots
                    .Include(x => x.StockItem)
                    .Include(x => x.Supplier)
                    .Include(x => x.Location)
                    .Include(x => x.CreatedByUser)
                    .Include(x => x.UpdatedByUser)
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (stockLot == null)
                {
                    return Result<StockLotResponseDto>.Failure("Stock lot not found");
                }

                var responseDto = _mapper.Map<StockLotResponseDto>(stockLot);
                return Result<StockLotResponseDto>.SuccessResult(responseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stock lot with id {Id}", id);
                return Result<StockLotResponseDto>.Failure($"An error occurred: {ex.Message}");
            }
        }

        public async Task<Result<PagedResult<StockLotListDto>>> GetAllAsync(StockLotFilterDto filter)
        {
            try
            {
                var query = _context.StockLots
                    .Include(x => x.StockItem)
                    .Include(x => x.Location)
                    .AsQueryable();

                // Apply filters
                if (filter.StockItemId.HasValue)
                    query = query.Where(x => x.StockItemId == filter.StockItemId.Value);

                if (!string.IsNullOrEmpty(filter.LotNumber))
                    query = query.Where(x => x.LotNumber.Contains(filter.LotNumber));

                if (!string.IsNullOrEmpty(filter.LabelNumber))
                    query = query.Where(x => x.LabelNumber.Contains(filter.LabelNumber));

                if (filter.SupplierId.HasValue)
                    query = query.Where(x => x.SupplierId == filter.SupplierId.Value);

                if (filter.LocationId.HasValue)
                    query = query.Where(x => x.LocationId == filter.LocationId.Value);

                if (!string.IsNullOrEmpty(filter.Status))
                    query = query.Where(x => x.Status == filter.Status);

                if (filter.IsBlocked.HasValue)
                    query = query.Where(x => x.IsBlocked == filter.IsBlocked.Value);

                if (!string.IsNullOrEmpty(filter.QualityGrade))
                    query = query.Where(x => x.QualityGrade == filter.QualityGrade);

                if (filter.ReceiptDateFrom.HasValue)
                    query = query.Where(x => x.ReceiptDate >= filter.ReceiptDateFrom.Value);

                if (filter.ReceiptDateTo.HasValue)
                    query = query.Where(x => x.ReceiptDate <= filter.ReceiptDateTo.Value);

                // Apply sorting
                query = filter.SortDirection.ToLower() == "asc" 
                    ? query.OrderBy(GetSortExpression(filter.SortBy))
                    : query.OrderByDescending(GetSortExpression(filter.SortBy));

                var totalCount = await query.CountAsync();

                var items = await query
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .Select(x => new StockLotListDto
                    {
                        Id = x.Id,
                        LotNumber = x.LotNumber,
                        LabelNumber = x.LabelNumber,
                        StockItemName = x.StockItem.Name,
                        CurrentWeight = x.CurrentWeight,
                        CurrentLength = x.CurrentLength,
                        Width = x.Width,
                        Thickness = x.Thickness,
                        QualityGrade = x.QualityGrade,
                        LocationName = x.Location != null ? x.Location.Name : "",
                        Status = x.Status,
                        IsBlocked = x.IsBlocked,
                        CreatedAt = x.CreatedAt
                    })
                    .ToListAsync();

                var pagedResult = PagedResult<StockLotListDto>.Create(items, totalCount, filter.Page, filter.PageSize);

                return Result<PagedResult<StockLotListDto>>.SuccessResult(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stock lots");
                return Result<PagedResult<StockLotListDto>>.Failure($"An error occurred: {ex.Message}");
            }
        }

        public async Task<Result<StockLotResponseDto>> CreateAsync(StockLotCreateDto createDto, int userId)
        {
            try
            {
                // Check if lot number exists
                var existingLot = await _context.StockLots
                    .FirstOrDefaultAsync(x => x.LotNumber == createDto.LotNumber);

                if (existingLot != null)
                {
                    return Result<StockLotResponseDto>.Failure("Lot number already exists");
                }

                var stockLot = _mapper.Map<StockLot>(createDto);
                stockLot.CurrentWeight = stockLot.InitialWeight;
                stockLot.CurrentLength = stockLot.InitialLength;
                stockLot.CreatedBy = userId;
                stockLot.CreatedAt = DateTime.Now;

                _context.StockLots.Add(stockLot);
                await _context.SaveChangesAsync();

                return await GetByIdAsync(stockLot.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating stock lot");
                return Result<StockLotResponseDto>.Failure($"An error occurred: {ex.Message}");
            }
        }

        public async Task<Result<StockLotResponseDto>> UpdateAsync(int id, StockLotUpdateDto updateDto, int userId)
        {
            try
            {
                var stockLot = await _context.StockLots.FindAsync(id);
                if (stockLot == null)
                {
                    return Result<StockLotResponseDto>.Failure("Stock lot not found");
                }

                _mapper.Map(updateDto, stockLot);
                stockLot.UpdatedBy = userId;
                stockLot.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetByIdAsync(stockLot.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stock lot with id {Id}", id);
                return Result<StockLotResponseDto>.Failure($"An error occurred: {ex.Message}");
            }
        }

        public async Task<Result<bool>> DeleteAsync(int id, int userId)
        {
            try
            {
                var stockLot = await _context.StockLots.FindAsync(id);
                if (stockLot == null)
                {
                    return Result<bool>.Failure("Stock lot not found");
                }

                // Check if lot has movements
                var hasMovements = await _context.StockMovements.AnyAsync(x => x.StockLotId == id);
                if (hasMovements)
                {
                    return Result<bool>.Failure("Cannot delete lot with existing movements");
                }

                _context.StockLots.Remove(stockLot);
                await _context.SaveChangesAsync();

                return Result<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting stock lot with id {Id}", id);
                return Result<bool>.Failure($"An error occurred: {ex.Message}");
            }
        }

        public async Task<Result<bool>> BlockLotAsync(int id, string blockReason, int userId)
        {
            try
            {
                var stockLot = await _context.StockLots.FindAsync(id);
                if (stockLot == null)
                {
                    return Result<bool>.Failure("Stock lot not found");
                }

                stockLot.IsBlocked = true;
                stockLot.BlockReason = blockReason;
                stockLot.UpdatedBy = userId;
                stockLot.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                return Result<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error blocking stock lot with id {Id}", id);
                return Result<bool>.Failure($"An error occurred: {ex.Message}");
            }
        }

        public async Task<Result<bool>> UnblockLotAsync(int id, int userId)
        {
            try
            {
                var stockLot = await _context.StockLots.FindAsync(id);
                if (stockLot == null)
                {
                    return Result<bool>.Failure("Stock lot not found");
                }

                stockLot.IsBlocked = false;
                stockLot.BlockReason = null;
                stockLot.UpdatedBy = userId;
                stockLot.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                return Result<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unblocking stock lot with id {Id}", id);
                return Result<bool>.Failure($"An error occurred: {ex.Message}");
            }
        }

        public async Task<Result<List<StockLotListDto>>> GetByStockItemIdAsync(int stockItemId)
        {
            try
            {
                var lots = await _context.StockLots
                    .Include(x => x.StockItem)
                    .Include(x => x.Location)
                    .Where(x => x.StockItemId == stockItemId)
                    .Select(x => new StockLotListDto
                    {
                        Id = x.Id,
                        LotNumber = x.LotNumber,
                        LabelNumber = x.LabelNumber,
                        StockItemName = x.StockItem.Name,
                        CurrentWeight = x.CurrentWeight,
                        CurrentLength = x.CurrentLength,
                        Width = x.Width,
                        Thickness = x.Thickness,
                        QualityGrade = x.QualityGrade,
                        LocationName = x.Location != null ? x.Location.Name : "",
                        Status = x.Status,
                        IsBlocked = x.IsBlocked,
                        CreatedAt = x.CreatedAt
                    })
                    .OrderByDescending(x => x.CreatedAt)
                    .ToListAsync();

                return Result<List<StockLotListDto>>.SuccessResult(lots);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting lots for stock item {StockItemId}", stockItemId);
                return Result<List<StockLotListDto>>.Failure($"An error occurred: {ex.Message}");
            }
        }

        public async Task<Result<List<StockLotListDto>>> GetAvailableLotsAsync(int stockItemId)
        {
            try
            {
                var lots = await _context.StockLots
                    .Include(x => x.StockItem)
                    .Include(x => x.Location)
                    .Where(x => x.StockItemId == stockItemId && 
                               x.Status == "ACTIVE" && 
                               !x.IsBlocked &&
                               x.CurrentWeight > 0 && 
                               x.CurrentLength > 0)
                    .Select(x => new StockLotListDto
                    {
                        Id = x.Id,
                        LotNumber = x.LotNumber,
                        LabelNumber = x.LabelNumber,
                        StockItemName = x.StockItem.Name,
                        CurrentWeight = x.CurrentWeight,
                        CurrentLength = x.CurrentLength,
                        Width = x.Width,
                        Thickness = x.Thickness,
                        QualityGrade = x.QualityGrade,
                        LocationName = x.Location != null ? x.Location.Name : "",
                        Status = x.Status,
                        IsBlocked = x.IsBlocked,
                        CreatedAt = x.CreatedAt
                    })
                    .OrderByDescending(x => x.CreatedAt)
                    .ToListAsync();

                return Result<List<StockLotListDto>>.SuccessResult(lots);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available lots for stock item {StockItemId}", stockItemId);
                return Result<List<StockLotListDto>>.Failure($"An error occurred: {ex.Message}");
            }
        }

        public async Task<Result<bool>> CheckLotNumberExistsAsync(string lotNumber)
        {
            try
            {
                var exists = await _context.StockLots.AnyAsync(x => x.LotNumber == lotNumber);
                return Result<bool>.SuccessResult(exists);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if lot number exists: {LotNumber}", lotNumber);
                return Result<bool>.Failure($"An error occurred: {ex.Message}");
            }
        }

        public async Task<Result<StockLotResponseDto>> GetByLotNumberAsync(string lotNumber)
        {
            try
            {
                var stockLot = await _context.StockLots
                    .Include(x => x.StockItem)
                    .Include(x => x.Supplier)
                    .Include(x => x.Location)
                    .FirstOrDefaultAsync(x => x.LotNumber == lotNumber);

                if (stockLot == null)
                {
                    return Result<StockLotResponseDto>.Failure("Stock lot not found");
                }

                var responseDto = _mapper.Map<StockLotResponseDto>(stockLot);
                return Result<StockLotResponseDto>.SuccessResult(responseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stock lot with lot number {LotNumber}", lotNumber);
                return Result<StockLotResponseDto>.Failure($"An error occurred: {ex.Message}");
            }
        }

        public async Task<Result<bool>> UpdateCurrentQuantitiesAsync(int id, decimal currentWeight, decimal currentLength)
        {
            try
            {
                var stockLot = await _context.StockLots.FindAsync(id);
                if (stockLot == null)
                {
                    return Result<bool>.Failure("Stock lot not found");
                }

                stockLot.CurrentWeight = currentWeight;
                stockLot.CurrentLength = currentLength;

                // Update status based on quantities
                if (currentWeight <= 0 || currentLength <= 0)
                {
                    stockLot.Status = "CONSUMED";
                }

                await _context.SaveChangesAsync();
                return Result<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating current quantities for lot {Id}", id);
                return Result<bool>.Failure($"An error occurred: {ex.Message}");
            }
        }

        private static Expression<Func<StockLot, object>> GetSortExpression(string sortBy)
        {
            return sortBy?.ToLower() switch
            {
                "lotnumber" => x => x.LotNumber,
                "labelnumber" => x => x.LabelNumber,
                "currentweight" => x => x.CurrentWeight,
                "currentlength" => x => x.CurrentLength,
                "status" => x => x.Status,
                "receiptdate" => x => x.ReceiptDate,
                _ => x => x.CreatedAt,
            };
        }
    }
}