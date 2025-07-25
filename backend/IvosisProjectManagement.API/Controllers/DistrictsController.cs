using IvosisProjectManagement.API.Attributes;
using IvosisProjectManagement.API.Enums;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class DistrictsController : ControllerBase
{
    private readonly DistrictService _service;

    public DistrictsController(DistrictService service)
    {
        _service = service;
    }

    [HttpGet]
    [LogActivity(ActivityType.View, "Districts")]
    public async Task<IActionResult> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    [LogActivity(ActivityType.View, "Districts/id")]
    public async Task<IActionResult> GetById(int id)
    {
        var district = await _service.GetByIdAsync(id);
        if (district == null) return NotFound();
        return Ok(district);
    }

    [HttpGet("by-neighborhoods/{id}")]
    [LogActivity(ActivityType.View, "Districts/by-neighborhoods")]
    public async Task<IActionResult> GetNeighborhoodsByDistrictId(int id)
    {
        var items = await _service.GetNeighborhoodsByDistrictIdAsync(id);
        if (items == null || !items.Any()) return NotFound();
        return Ok(items);
    }

    [HttpPost]
    [LogActivity(ActivityType.Create, "Districts")]
    public async Task<IActionResult> Create([FromBody] DistrictDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [LogActivity(ActivityType.Update, "Districts")]
    public async Task<IActionResult> Update(int id, [FromBody] DistrictDto dto)
    {
        if (id != dto.Id) return BadRequest();

        var updated = await _service.UpdateAsync(id, dto);
        if (!updated) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [LogActivity(ActivityType.Delete, "Districts")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound();

        return NoContent();
    }
}
