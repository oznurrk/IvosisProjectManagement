using System.Security.Claims;
using IvosisProjectManagement.API.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StockMovementsController : BaseController
    {
        private readonly IStockMovementService _stockMovementService;

        public StockMovementsController(IStockMovementService stockMovementService)
        {
            _stockMovementService = stockMovementService;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetStockMovements([FromQuery] StockMovementFilterDto filter)
        {
            try
            {
                var (movements, totalCount) = await _stockMovementService.GetFilteredAsync(filter);
                
                return Ok(new
                {
                    success = true,
                    data = movements,
                    totalCount = totalCount,
                    page = filter.Page,
                    pageSize = filter.PageSize
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetStockMovement(int id)
        {
            try
            {
                var movement = await _stockMovementService.GetByIdAsync(id);
                if (movement == null)
                    return NotFound(new { success = false, message = "Stock movement not found" });

                return Ok(new { success = true, data = movement });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("stock-in")]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<ActionResult<object>> CreateStockIn([FromBody] CreateStockMovementDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var movement = await _stockMovementService.CreateStockInAsync(dto, userId);
                
                return CreatedAtAction(nameof(GetStockMovement), new { id = movement.Id }, 
                    new { success = true, data = movement, message = "Stock in created successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("stock-out")]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<ActionResult<object>> CreateStockOut([FromBody] CreateStockMovementDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var movement = await _stockMovementService.CreateStockOutAsync(dto, userId);
                
                return CreatedAtAction(nameof(GetStockMovement), new { id = movement.Id }, 
                    new { success = true, data = movement, message = "Stock out created successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while creating stock out" });
            }
        }

        [HttpPost("transfer")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<object>> CreateTransfer([FromQuery] int fromLocationId, [FromQuery] int toLocationId, [FromBody] CreateStockMovementDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var movement = await _stockMovementService.CreateTransferAsync(fromLocationId, toLocationId, dto, userId);
                
                return CreatedAtAction(nameof(GetStockMovement), new { id = movement.Id }, 
                    new { success = true, data = movement, message = "Stock transfer created successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while creating transfer" });
            }
        }

        [HttpPost("adjustment")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<object>> CreateAdjustment([FromBody] CreateStockMovementDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var movement = await _stockMovementService.CreateAdjustmentAsync(dto, userId);
                
                return CreatedAtAction(nameof(GetStockMovement), new { id = movement.Id }, 
                    new { success = true, data = movement, message = "Stock adjustment created successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("recent")]
        public async Task<ActionResult<object>> GetRecentMovements([FromQuery] int take = 10)
        {
            try
            {
                var movements = await _stockMovementService.GetRecentMovementsAsync(take);
                return Ok(new { success = true, data = movements });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("monthly-turnover")]
        public async Task<ActionResult<object>> GetMonthlyTurnover([FromQuery] DateTime? month = null)
        {
            try
            {
                var turnover = await _stockMovementService.GetMonthlyTurnoverAsync(month);
                return Ok(new { success = true, data = new { turnover, month = month ?? DateTime.Now } });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("by-item/{stockItemId}")]
        public async Task<ActionResult<object>> GetMovementsByStockItem(int stockItemId, [FromQuery] int take = 10)
        {
            try
            {
                var movements = await _stockMovementService.GetByStockItemAsync(stockItemId, take);
                return Ok(new { success = true, data = movements });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }