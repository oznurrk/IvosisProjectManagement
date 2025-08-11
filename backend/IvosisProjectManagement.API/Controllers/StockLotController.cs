using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using IvosisProjectManagement.API.DTOs.Common;
using IvosisProjectManagement.API.Services.Interfaces;

namespace IvosisProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StockLotController : ControllerBase
    {
        private readonly IStockLotService _stockLotService;
        private readonly ILogger<StockLotController> _logger;

        public StockLotController(IStockLotService stockLotService, ILogger<StockLotController> logger)
        {
            _stockLotService = stockLotService;
            _logger = logger;
        }

        /// <summary>
        /// Get stock lot by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<StockLotResponseDto>> GetById(int id)
        {
            var result = await _stockLotService.GetByIdAsync(id);
            
            if (result.Success)
                return Ok(result.Data);
            
            return NotFound(new { message = result.Message });
        }

        /// <summary>
        /// Get all stock lots with filtering and pagination
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<PagedResult<StockLotListDto>>> GetAll([FromQuery] StockLotFilterDto filter)
        {
            var result = await _stockLotService.GetAllAsync(filter);
            
            if (result.Success)
                return Ok(result.Data);
            
            return BadRequest(new { message = result.Message });
        }

        /// <summary>
        /// Create new stock lot
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<StockLotResponseDto>> Create([FromBody] StockLotCreateDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetCurrentUserId();
            var result = await _stockLotService.CreateAsync(createDto, userId);
            
            if (result.Success)
                return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result.Data);
            
            return BadRequest(new { message = result.Message });
        }

        /// <summary>
        /// Update stock lot
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<StockLotResponseDto>> Update(int id, [FromBody] StockLotUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetCurrentUserId();
            var result = await _stockLotService.UpdateAsync(id, updateDto, userId);
            
            if (result.Success)
                return Ok(result.Data);
            
            return BadRequest(new { message = result.Message });
        }

        /// <summary>
        /// Delete stock lot
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var userId = GetCurrentUserId();
            var result = await _stockLotService.DeleteAsync(id, userId);
            
            if (result.Success)
                return NoContent();
            
            return BadRequest(new { message = result.Message });
        }

        /// <summary>
        /// Block stock lot
        /// </summary>
        [HttpPost("{id}/block")]
        public async Task<ActionResult> BlockLot(int id, [FromBody] BlockLotRequest request)
        {
            if (string.IsNullOrEmpty(request.BlockReason))
                return BadRequest(new { message = "Block reason is required" });

            var userId = GetCurrentUserId();
            var result = await _stockLotService.BlockLotAsync(id, request.BlockReason, userId);
            
            if (result.Success)
                return Ok(new { message = "Lot blocked successfully" });
            
            return BadRequest(new { message = result.Message });
        }

        /// <summary>
        /// Unblock stock lot
        /// </summary>
        [HttpPost("{id}/unblock")]
        public async Task<ActionResult> UnblockLot(int id)
        {
            var userId = GetCurrentUserId();
            var result = await _stockLotService.UnblockLotAsync(id, userId);
            
            if (result.Success)
                return Ok(new { message = "Lot unblocked successfully" });
            
            return BadRequest(new { message = result.Message });
        }

        /// <summary>
        /// Get lots by stock item ID
        /// </summary>
        [HttpGet("by-stock-item/{stockItemId}")]
        public async Task<ActionResult<List<StockLotListDto>>> GetByStockItemId(int stockItemId)
        {
            var result = await _stockLotService.GetByStockItemIdAsync(stockItemId);
            
            if (result.Success)
                return Ok(result.Data);
            
            return BadRequest(new { message = result.Message });
        }

        /// <summary>
        /// Get available lots for stock item (not blocked, has quantity)
        /// </summary>
        [HttpGet("available/{stockItemId}")]
        public async Task<ActionResult<List<StockLotListDto>>> GetAvailableLots(int stockItemId)
        {
            var result = await _stockLotService.GetAvailableLotsAsync(stockItemId);
            
            if (result.Success)
                return Ok(result.Data);
            
            return BadRequest(new { message = result.Message });
        }

        /// <summary>
        /// Check if lot number exists
        /// </summary>
        [HttpGet("check-lot-number/{lotNumber}")]
        public async Task<ActionResult<bool>> CheckLotNumberExists(string lotNumber)
        {
            var result = await _stockLotService.CheckLotNumberExistsAsync(lotNumber);
            
            if (result.Success)
                return Ok(new { exists = result.Data });
            
            return BadRequest(new { message = result.Message });
        }

        /// <summary>
        /// Get stock lot by lot number
        /// </summary>
        [HttpGet("by-lot-number/{lotNumber}")]
        public async Task<ActionResult<StockLotResponseDto>> GetByLotNumber(string lotNumber)
        {
            var result = await _stockLotService.GetByLotNumberAsync(lotNumber);
            
            if (result.Success)
                return Ok(result.Data);
            
            return NotFound(new { message = result.Message });
        }

        /// <summary>
        /// Update current quantities (weight and length)
        /// </summary>
        [HttpPut("{id}/quantities")]
        public async Task<ActionResult> UpdateCurrentQuantities(int id, [FromBody] UpdateQuantitiesRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _stockLotService.UpdateCurrentQuantitiesAsync(id, request.CurrentWeight, request.CurrentLength);
            
            if (result.Success)
                return Ok(new { message = "Quantities updated successfully" });
            
            return BadRequest(new { message = result.Message });
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }
    }

    // Request DTOs
    public class BlockLotRequest
    {
        [Required]
        [StringLength(250)]
        public string BlockReason { get; set; }
    }

    public class UpdateQuantitiesRequest
    {
        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Current weight must be greater than or equal to 0")]
        public decimal CurrentWeight { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Current length must be greater than or equal to 0")]
        public decimal CurrentLength { get; set; }
    }
}