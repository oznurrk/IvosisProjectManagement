using AutoMapper;
using IvosisProjectManagement.API.DTOs;

public class StockMovementService : IStockMovementService
    {
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IStockBalanceRepository _stockBalanceRepository;
        private readonly IStockAlertService _stockAlertService;
        private readonly IMapper _mapper;

        public StockMovementService(
            IStockMovementRepository stockMovementRepository,
            IStockBalanceRepository stockBalanceRepository,
            IStockAlertService stockAlertService,
            IMapper mapper)
        {
            _stockMovementRepository = stockMovementRepository;
            _stockBalanceRepository = stockBalanceRepository;
            _stockAlertService = stockAlertService;
            _mapper = mapper;
        }

        public async Task<(IEnumerable<StockMovementDto> Movements, int TotalCount)> GetFilteredAsync(StockMovementFilterDto filter)
        {
            return await _stockMovementRepository.GetFilteredAsync(filter);
        }

        public async Task<StockMovementDto> GetByIdAsync(int id)
        {
            var movement = await _stockMovementRepository.GetByIdAsync(id);
            return _mapper.Map<StockMovementDto>(movement);
        }

        public async Task<StockMovementDto> CreateStockInAsync(CreateStockMovementDto dto, int userId)
        {
            dto.MovementType = "IN";
            var movement = await _stockMovementRepository.CreateMovementAsync(dto, userId);
            
            // Update stock balance
            await _stockBalanceRepository.UpdateBalanceAsync(dto.StockItemId, dto.LocationId, dto.Quantity, "IN");
            
            // Check for alerts
            await _stockAlertService.CheckAndCreateAlertsAsync();
            
            var result = await _stockMovementRepository.GetByIdAsync(movement.Id);
            return _mapper.Map<StockMovementDto>(result);
        }

        public async Task<StockMovementDto> CreateStockOutAsync(CreateStockMovementDto dto, int userId)
        {
            // Check available stock
            var availableStock = await _stockBalanceRepository.GetAvailableStockAsync(dto.StockItemId, dto.LocationId);
            if (availableStock < dto.Quantity)
                throw new InvalidOperationException($"Insufficient stock. Available: {availableStock}, Requested: {dto.Quantity}");

            dto.MovementType = "OUT";
            var movement = await _stockMovementRepository.CreateMovementAsync(dto, userId);
            
            // Update stock balance
            await _stockBalanceRepository.UpdateBalanceAsync(dto.StockItemId, dto.LocationId, dto.Quantity, "OUT");
            
            // Check for alerts
            await _stockAlertService.CheckAndCreateAlertsAsync();
            
            var result = await _stockMovementRepository.GetByIdAsync(movement.Id);
            return _mapper.Map<StockMovementDto>(result);
        }

        public async Task<StockMovementDto> CreateTransferAsync(int fromLocationId, int toLocationId, CreateStockMovementDto dto, int userId)
        {
            // Check available stock at source location
            var availableStock = await _stockBalanceRepository.GetAvailableStockAsync(dto.StockItemId, fromLocationId);
            if (availableStock < dto.Quantity)
                throw new InvalidOperationException($"Insufficient stock at source location. Available: {availableStock}, Requested: {dto.Quantity}");

            dto.MovementType = "TRANSFER";
            
            // Create OUT movement at source location
            var outDto = new CreateStockMovementDto
            {
                StockItemId = dto.StockItemId,
                LocationId = fromLocationId,
                MovementType = "OUT",
                Quantity = dto.Quantity,
                UnitPrice = dto.UnitPrice,
                ReferenceType = "TRANSFER",
                ReferenceNumber = dto.ReferenceNumber,
                Description = $"Transfer to Location {toLocationId}: {dto.Description}",
                MovementDate = dto.MovementDate
            };

            var outMovement = await _stockMovementRepository.CreateMovementAsync(outDto, userId);
            await _stockBalanceRepository.UpdateBalanceAsync(dto.StockItemId, fromLocationId, -dto.Quantity, "OUT");

            // Create IN movement at destination location
            var inDto = new CreateStockMovementDto
            {
                StockItemId = dto.StockItemId,
                LocationId = toLocationId,
                MovementType = "IN",
                Quantity = dto.Quantity,
                UnitPrice = dto.UnitPrice,
                ReferenceType = "TRANSFER",
                ReferenceNumber = dto.ReferenceNumber,
                Description = $"Transfer from Location {fromLocationId}: {dto.Description}",
                MovementDate = dto.MovementDate
            };

            var inMovement = await _stockMovementRepository.CreateMovementAsync(inDto, userId);
            await _stockBalanceRepository.UpdateBalanceAsync(dto.StockItemId, toLocationId, dto.Quantity, "IN");

            // Check for alerts
            await _stockAlertService.CheckAndCreateAlertsAsync();

            var result = await _stockMovementRepository.GetByIdAsync(inMovement.Id);
            return _mapper.Map<StockMovementDto>(result);
        }

        public async Task<StockMovementDto> CreateAdjustmentAsync(CreateStockMovementDto dto, int userId)
        {
            dto.MovementType = "ADJUSTMENT";
            var movement = await _stockMovementRepository.CreateMovementAsync(dto, userId);
            
            // Update stock balance with adjustment quantity
            await _stockBalanceRepository.UpdateBalanceAsync(dto.StockItemId, dto.LocationId, dto.Quantity, "ADJUSTMENT");
            
            // Check for alerts
            await _stockAlertService.CheckAndCreateAlertsAsync();
            
            var result = await _stockMovementRepository.GetByIdAsync(movement.Id);
            return _mapper.Map<StockMovementDto>(result);
        }

        public async Task<IEnumerable<StockMovementDto>> GetByStockItemAsync(int stockItemId, int take = 10)
        {
            return await _stockMovementRepository.GetByStockItemAsync(stockItemId, take);
        }

        public async Task<IEnumerable<RecentMovementDto>> GetRecentMovementsAsync(int take = 10)
        {
            return await _stockMovementRepository.GetRecentMovementsAsync(take);
        }

        public async Task<decimal> GetMonthlyTurnoverAsync(DateTime? month = null)
        {
            return await _stockMovementRepository.GetMonthlyTurnoverAsync(month);
        }
    }