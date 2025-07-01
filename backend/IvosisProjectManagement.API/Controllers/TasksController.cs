using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IvosisProjectManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TasksController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _taskService.GetAllAsync();
            return Ok(tasks); // TaskItemDto listesi dönecek
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var task = await _taskService.GetByIdAsync(id);
            if (task == null) return NotFound();
            return Ok(task); // TaskItemDto döner
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TaskItemCreateDto dto)
        {
            var created = await _taskService.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created); // TaskItemDto döner
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskItemUpdateDto dto)
        {
            var updated = await _taskService.UpdateAsync(id, dto);
            if (!updated)
                return NotFound();

            var updatedTask = await _taskService.GetByIdAsync(id);
            return Ok(updatedTask); // Güncel TaskItemDto döner
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _taskService.DeleteAsync(id);
            if (!deleted)
                return NotFound(new { message = "Kayıt bulunamadı." });

            return Ok(new { message = "Kayıt başarıyla silindi." });
        }
    }
}
