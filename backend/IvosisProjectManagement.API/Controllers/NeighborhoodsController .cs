using IvosisProjectManagement.API.Controllers;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class NeighborhoodsController : BaseController
{
    private readonly NeighborhoodService _service;

    public NeighborhoodsController(NeighborhoodService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpGet("by-districts/{id}")]
    public async Task<IActionResult> GetByDistrictsId(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] NeighborhoodDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] NeighborhoodDto dto)
    {
        if (id != dto.Id) return BadRequest();

        var updated = await _service.UpdateAsync(id, dto);
        if (!updated) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound();

        return NoContent();
    }
}
