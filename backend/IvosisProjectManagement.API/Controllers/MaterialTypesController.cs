using IvosisProjectManagement.API.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaterialTypesController : BaseController
{
    private readonly IMaterialTypeService _service;

    public MaterialTypesController(IMaterialTypeService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetMaterialTypes([FromQuery] int? materialNameId = null, [FromQuery] bool? onlyActive = true)
    {
        try
        {
            IEnumerable<MaterialTypeDto> items;
            
            if (materialNameId.HasValue)
            {
                items = await _service.GetByMaterialNameIdAsync(materialNameId.Value);
            }
            else
            {
                items = onlyActive.GetValueOrDefault(true) 
                    ? await _service.GetActiveAsync() 
                    : await _service.GetAllAsync();
            }
            
            return Ok(new { success = true, data = items });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetMaterialType(int id)
    {
        try
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null)
                return NotFound(new { success = false, message = "Material type not found" });

            return Ok(new { success = true, data = item });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<object>> CreateMaterialType([FromBody] MaterialTypeDtoCreate dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var item = await _service.CreateAsync(dto, userId);
            
            return CreatedAtAction(nameof(GetMaterialType), new { id = item.Id }, 
                new { success = true, data = item, message = "Material type created successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "An error occurred while creating the material type" });
        }
    }
}
