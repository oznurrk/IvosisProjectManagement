using IvosisProjectManagement.API.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaterialQualitiesController : BaseController
{
    private readonly IMaterialQualityService _service;

    public MaterialQualitiesController(IMaterialQualityService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetMaterialQualities([FromQuery] int? materialTypeId = null, [FromQuery] bool? onlyActive = true)
    {
        try
        {
            IEnumerable<MaterialQualityDto> items;
            
            if (materialTypeId.HasValue)
            {
                items = await _service.GetByMaterialTypeIdAsync(materialTypeId.Value);
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
    public async Task<ActionResult<object>> GetMaterialQuality(int id)
    {
        try
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null)
                return NotFound(new { success = false, message = "Material quality not found" });

            return Ok(new { success = true, data = item });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<object>> CreateMaterialQuality([FromBody] MaterialQualityDtoCreate dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var item = await _service.CreateAsync(dto, userId);
            
            return CreatedAtAction(nameof(GetMaterialQuality), new { id = item.Id }, 
                new { success = true, data = item, message = "Material quality created successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "An error occurred while creating the material quality" });
        }
    }
}