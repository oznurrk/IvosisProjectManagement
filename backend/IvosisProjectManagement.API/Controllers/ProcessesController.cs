using IvosisProjectManagement.API.Models;
using IvosisProjectManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace IvosisProjectManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProcessesController : ControllerBase
    {
        private readonly IProcessService _service;

        public ProcessesController(IProcessService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var process = await _service.GetByIdAsync(id);
            if (process == null) return NotFound();
            return Ok(process);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Process process)
        {
            var created = await _service.CreateAsync(process);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Process process)
        {
            if (id != process.Id) return BadRequest();
            var updated = await _service.UpdateAsync(process);
            return updated ? NoContent() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
