using IvosisProjectManagement.API.Attributes;
using IvosisProjectManagement.API.Enums;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class CitiesController : ControllerBase
{
    private readonly CityService _service;

    public CitiesController(CityService service)
    {
        _service = service;
    }

    [HttpGet]
    [LogActivity(ActivityType.View, "Cities")]
    public async Task<IActionResult> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    [LogActivity(ActivityType.View, "Cities/id")]
    public async Task<IActionResult> GetById(int id)
    {
        var city = await _service.GetByIdAsync(id);
        if (city == null) return NotFound();
        return Ok(city);
    }

    [HttpGet("by-districts/{id}")]
    [LogActivity(ActivityType.View, "Cities/by-districts")]
    public async Task<IActionResult> GetDistrictsByCityIdAsync(int id)
    {
        var items = await _service.GetDistrictsByCityIdAsync(id);
        if (items == null || !items.Any()) return NotFound();
        return Ok(items);
    }

    [HttpPost]
    [LogActivity(ActivityType.Create, "Cities")]
    public async Task<IActionResult> Create([FromBody] CityDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [LogActivity(ActivityType.Update, "Cities")]
    public async Task<IActionResult> Update(int id, [FromBody] CityDto dto)
    {
        if (id != dto.Id) return BadRequest();

        var updated = await _service.UpdateAsync(id, dto);
        if (!updated) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [LogActivity(ActivityType.Delete, "Cities")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound();

        return NoContent();
    }
}
