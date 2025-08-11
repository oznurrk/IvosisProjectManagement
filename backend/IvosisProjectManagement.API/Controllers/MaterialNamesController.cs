using IvosisProjectManagement.API.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaterialNamesController : BaseController
{
    private readonly IMaterialNameService _service;

    public MaterialNamesController(IMaterialNameService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetMaterialNames([FromQuery] bool? onlyActive = true)
    {
        try
        {
            var items = onlyActive.GetValueOrDefault(true) 
                ? await _service.GetActiveAsync() 
                : await _service.GetAllAsync();
            
            return Ok(new { success = true, data = items });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetMaterialName(int id)
    {
        try
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null)
                return NotFound(new { success = false, message = "Material name not found" });

            return Ok(new { success = true, data = item });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<object>> CreateMaterialName([FromBody] MaterialNameDtoCreate dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var item = await _service.CreateAsync(dto, userId);
            
            return CreatedAtAction(nameof(GetMaterialName), new { id = item.Id }, 
                new { success = true, data = item, message = "Material name created successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "An error occurred while creating the material name" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<object>> UpdateMaterialName(int id, [FromBody] MaterialNameDtoCreate dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var item = await _service.UpdateAsync(id, dto, userId);
            
            return Ok(new { success = true, data = item, message = "Material name updated successfully" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<object>> DeleteMaterialName(int id)
    {
        try
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
                return NotFound(new { success = false, message = "Material name not found" });

            return Ok(new { success = true, message = "Material name deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "An error occurred while deleting the material name" });
        }
    }
}


