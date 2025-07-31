using System.Security.Claims;
using IvosisProjectManagement.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StockItemsController : ControllerBase
    {
        private readonly IStockItemService _stockItemService;

        public StockItemsController(IStockItemService stockItemService)
        {
            _stockItemService = stockItemService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetStockItems([FromQuery] StockItemFilterDto filter)
        {
            try
            {
                var (items, totalCount) = await _stockItemService.GetFilteredAsync(filter);
                
                return Ok(new
                {
                    success = true,
                    data = items,
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
        public async Task<ActionResult<object>> GetStockItem(int id)
        {
            try
            {
                var item = await _stockItemService.GetByIdAsync(id);
                if (item == null)
                    return NotFound(new { success = false, message = "Stock item not found" });

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("code/{itemCode}")]
        public async Task<ActionResult<object>> GetStockItemByCode(string itemCode)
        {
            try
            {
                var item = await _stockItemService.GetByCodeAsync(itemCode);
                if (item == null)
                    return NotFound(new { success = false, message = "Stock item not found" });

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<object>> CreateStockItem([FromBody] StockItemDtoCreate dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var item = await _stockItemService.CreateAsync(dto, userId);
                
                return CreatedAtAction(nameof(GetStockItem), new { id = item.Id }, 
                    new { success = true, data = item, message = "Stock item created successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while creating the stock item" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<object>> UpdateStockItem(int id, [FromBody] StockItemDtoUpdate dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var item = await _stockItemService.UpdateAsync(id, dto, userId);
                
                return Ok(new { success = true, data = item, message = "Stock item updated successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while updating the stock item" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> DeleteStockItem(int id)
        {
            try
            {
                var success = await _stockItemService.DeleteAsync(id);
                if (!success)
                    return NotFound(new { success = false, message = "Stock item not found" });

                return Ok(new { success = true, message = "Stock item deleted successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while deleting the stock item" });
            }
        }

        [HttpGet("low-stock")]
        public async Task<ActionResult<object>> GetLowStockItems()
        {
            try
            {
                var items = await _stockItemService.GetLowStockItemsAsync();
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("critical-stock")]
        public async Task<ActionResult<object>> GetCriticalStockItems()
        {
            try
            {
                var items = await _stockItemService.GetCriticalStockItemsAsync();
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<object>> SearchStockItems([FromQuery] string q)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(q))
                    return BadRequest(new { success = false, message = "Search term is required" });

                var items = await _stockItemService.SearchAsync(q);
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("check-code/{itemCode}")]
        public async Task<ActionResult<object>> CheckItemCodeUnique(string itemCode, [FromQuery] int? excludeId = null)
        {
            try
            {
                var isUnique = await _stockItemService.IsItemCodeUniqueAsync(itemCode, excludeId);
                return Ok(new { success = true, data = new { isUnique } });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }