using IvosisProjectManagement.API.Controllers;
using IvosisProjectManagement.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StockItemsController : BaseController
    {
        private readonly IStockItemService _stockItemService;
        private readonly IAuthorizationService _authService;
        private readonly IMaterialNameService _materialNameService;
        private readonly IMaterialTypeService _materialTypeService;
        private readonly IMaterialQualityService _materialQualityService;

    public StockItemsController(IStockItemService stockItemService, IAuthorizationService authService,
        IMaterialNameService materialNameService, 
        IMaterialTypeService materialTypeService, 
        IMaterialQualityService materialQualityService)
    {
        _stockItemService = stockItemService;
        _authService = authService;
        _materialNameService = materialNameService;
        _materialTypeService = materialTypeService;    
        _materialQualityService = materialQualityService;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetStockItems([FromQuery] StockItemFilterDto filter)
    {
        try
        {
            var userId = GetCurrentUserId();
            
            // Grup seviyesi erişimi olanlar (İK, Satınalma) tüm stokları görebilir
            if (HasGroupAccess() || GetCurrentUserRoles().Any(r => r.Contains("PURCHASE")))
            {
                var (allItems, totalCount) = await _stockItemService.GetFilteredAsync(filter);
                return Ok(new
                {
                    success = true,
                    data = allItems,
                    totalCount = totalCount,
                    page = filter.Page,
                    pageSize = filter.PageSize
                });
            }
            
            // Diğerleri sadece erişebildikleri firmaların stoklarını görebilir
            var accessibleCompanies = await _authService.GetUserAccessibleCompaniesAsync(userId);
            filter.CompanyIds = accessibleCompanies; // Filter'a firma kısıtlaması ekle
            
            var (items, count) = await _stockItemService.GetFilteredAsync(filter);
            
            return Ok(new
            {
                success = true,
                data = items,
                totalCount = count,
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

            var userId = GetCurrentUserId();
            
            // Yetki kontrolü
            if (!HasGroupAccess() && item.CompanyId.HasValue)
            {
                if (!await _authService.CanUserAccessCompanyAsync(userId, item.CompanyId.Value))
                    return Forbid("Bu stok kalemine erişim yetkiniz yok.");
            }

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
            
            // CompanyId kontrolü
            if (!dto.CompanyId.HasValue)
            {
                dto.CompanyId = GetCurrentCompanyId();
            }
            
            // Yetki kontrolü
            if (dto.CompanyId.HasValue && !HasGroupAccess())
            {
                if (!await _authService.CanUserAccessCompanyAsync(userId, dto.CompanyId.Value))
                    return Forbid("Bu firmaya stok kalemi ekleme yetkiniz yok.");
            }
            
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
        //mATERİAL NAME, TYPE, QUALITY GET METHODS
        // These methods are used to fetch material names, types, and qualities for stock items.
        [HttpGet("material-names")]
        public async Task<ActionResult<object>> GetMaterialNames()
        {
            try
            {
                var materialNames = await _materialNameService.GetActiveAsync();
                return Ok(new { success = true, data = materialNames });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("material-types")]
        public async Task<ActionResult<object>> GetMaterialTypes([FromQuery] int? materialNameId = null)
        {
            try
            {
                var materialTypes = materialNameId.HasValue 
                    ? await _materialTypeService.GetByMaterialNameIdAsync(materialNameId.Value)
                    : await _materialTypeService.GetActiveAsync();
                    
                return Ok(new { success = true, data = materialTypes });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("material-qualities")]
        public async Task<ActionResult<object>> GetMaterialQualities([FromQuery] int? materialTypeId = null)
        {
            try
            {
                var materialQualities = materialTypeId.HasValue 
                    ? await _materialQualityService.GetByMaterialTypeIdAsync(materialTypeId.Value)
                    : await _materialQualityService.GetActiveAsync();
                    
                return Ok(new { success = true, data = materialQualities });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("lot-tracking-items")]
        public async Task<ActionResult<object>> GetLotTrackingItems()
        {
            try
            {
                var filter = new StockItemFilterDto { HasLotTracking = true };
                var userId = GetCurrentUserId();
                
                if (!HasGroupAccess() && !GetCurrentUserRoles().Any(r => r.Contains("PURCHASE")))
                {
                    var accessibleCompanies = await _authService.GetUserAccessibleCompaniesAsync(userId);
                    filter.CompanyIds = accessibleCompanies;
                }
                
                var (items, totalCount) = await _stockItemService.GetFilteredAsync(filter);
                return Ok(new { success = true, data = items, totalCount });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("by-material")]
        public async Task<ActionResult<object>> GetStockItemsByMaterial(
            [FromQuery] int? materialNameId = null,
            [FromQuery] int? materialTypeId = null,
            [FromQuery] int? materialQualityId = null)
        {
        try
        {
            var filter = new StockItemFilterDto
            {
                MaterialNameId = materialNameId,
                MaterialTypeId = materialTypeId,
                MaterialQualityId = materialQualityId
            };
            
            var userId = GetCurrentUserId();
            
            if (!HasGroupAccess() && !GetCurrentUserRoles().Any(r => r.Contains("PURCHASE")))
            {
                var accessibleCompanies = await _authService.GetUserAccessibleCompaniesAsync(userId);
                filter.CompanyIds = accessibleCompanies;
            }
            
            var (items, totalCount) = await _stockItemService.GetFilteredAsync(filter);
            return Ok(new { success = true, data = items, totalCount });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}
