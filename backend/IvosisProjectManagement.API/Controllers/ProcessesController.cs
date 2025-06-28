using IvosisProjectManagement.API.Models;
using IvosisProjectManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
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

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var process = await _service.GetByIdAsync(id);
            if (process == null) return NotFound();
            return Ok(process);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Process process)
        {
            var created = await _service.CreateAsync(process);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Process process)
        {
            if (id != process.Id) return BadRequest();

            var updated = await _service.UpdateAsync(process);

            if (!updated)
                return NotFound();

            var updatedProcess = await _service.GetByIdAsync(id);
            return Ok(updatedProcess); // 200 OK + body
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
                return NotFound(new { message = "Kayıt bulunamadı." });

            return Ok(new { message = "Kayıt başarıyla silindi." });
        }

    }
}
