using AutoMapper;
using IvosisProjectManagement.API.DTOs;

public class StockItemService : IStockItemService
{
    private readonly IStockItemRepository _stockItemRepository;
    private readonly IStockBalanceRepository _stockBalanceRepository;
    private readonly IStockAlertService _stockAlertService;
    private readonly IMapper _mapper;

    public StockItemService(
        IStockItemRepository stockItemRepository,
        IStockBalanceRepository stockBalanceRepository,
        IStockAlertService stockAlertService,
        IMapper mapper)
    {
        _stockItemRepository = stockItemRepository;
        _stockBalanceRepository = stockBalanceRepository;
        _stockAlertService = stockAlertService;
        _mapper = mapper;
    }

    public async Task<(IEnumerable<StockItemDto> Items, int TotalCount)> GetFilteredAsync(StockItemFilterDto filter)
    {
        try
        {
            return await _stockItemRepository.GetFilteredAsync(filter);
        }
    catch (Exception ex)
    {
        throw new Exception($"StockItemService.GetFilteredAsync Error: {ex.Message}", ex);
    }
    }

    public async Task<StockItemDto> GetByIdAsync(int id)
    {
        return await _stockItemRepository.GetByIdWithDetailsAsync(id);
    }

    public async Task<StockItemDto> GetByCodeAsync(string itemCode)
    {
        return await _stockItemRepository.GetByCodeAsync(itemCode);
    }

    public async Task<StockItemDto> CreateAsync(StockItemDtoCreate dto, int userId)
    {
        // Validate unique item code
        if (!await _stockItemRepository.IsItemCodeUniqueAsync(dto.ItemCode))
            throw new InvalidOperationException($"Item code '{dto.ItemCode}' already exists.");

        var stockItem = _mapper.Map<StockItem>(dto);
        stockItem.CreatedBy = userId;
        stockItem.CreatedAt = DateTime.Now;

        var createdItem = await _stockItemRepository.AddAsync(stockItem);
        return await _stockItemRepository.GetByIdWithDetailsAsync(createdItem.Id);
    }

    public async Task<StockItemDto> UpdateAsync(int id, StockItemDtoUpdate dto, int userId)
    {
        var existingItem = await _stockItemRepository.GetByIdAsync(id);
        if (existingItem == null)
            throw new KeyNotFoundException($"Stock item with ID {id} not found.");

        // Validate unique item code (excluding current item)
        if (!await _stockItemRepository.IsItemCodeUniqueAsync(dto.ItemCode, id))
            throw new InvalidOperationException($"Item code '{dto.ItemCode}' already exists.");

        _mapper.Map(dto, existingItem);
        existingItem.UpdatedBy = userId;
        existingItem.UpdatedAt = DateTime.Now;

        await _stockItemRepository.UpdateAsync(existingItem);
        return await _stockItemRepository.GetByIdWithDetailsAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var stockItem = await _stockItemRepository.GetByIdAsync(id);
        if (stockItem == null) return false;

        // Check if item has stock movements
        var totalStock = await _stockBalanceRepository.GetTotalStockAsync(id);
        if (totalStock > 0)
            throw new InvalidOperationException("Cannot delete item with existing stock.");

        return await _stockItemRepository.DeleteAsync(id);
    }

    public async Task<IEnumerable<StockItemDto>> GetLowStockItemsAsync()
    {
        return await _stockItemRepository.GetLowStockItemsAsync();
    }

    public async Task<IEnumerable<StockItemDto>> GetCriticalStockItemsAsync()
    {
        return await _stockItemRepository.GetCriticalStockItemsAsync();
    }

    public async Task<IEnumerable<StockItemDto>> SearchAsync(string searchTerm)
    {
        return await _stockItemRepository.SearchAsync(searchTerm);
    }

    public async Task<bool> IsItemCodeUniqueAsync(string itemCode, int? excludeId = null)
    {
        return await _stockItemRepository.IsItemCodeUniqueAsync(itemCode, excludeId);
    }

     public async Task<IEnumerable<StockItemDto>> GetByMaterialNameIdAsync(int materialNameId)
    {
        return await _stockItemRepository.GetByMaterialNameIdAsync(materialNameId);
    }

    public async Task<IEnumerable<StockItemDto>> GetByMaterialTypeIdAsync(int materialTypeId)
    {
        return await _stockItemRepository.GetByMaterialTypeIdAsync(materialTypeId);
    }

    public async Task<IEnumerable<StockItemDto>> GetByMaterialQualityIdAsync(int materialQualityId)
    {
        return await _stockItemRepository.GetByMaterialQualityIdAsync(materialQualityId);
    }

    public async Task<IEnumerable<StockItemDto>> GetLotTrackingItemsAsync()
    {
        return await _stockItemRepository.GetLotTrackingItemsAsync();
    }
}