using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.Services.Interfaces;
using IvosisProjectManagement.API.Attributes;
using IvosisProjectManagement.API.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using IvosisProjectManagement.API.Services;

namespace IvosisProjectManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TasksController : BaseController
    {
        private readonly ITaskService _taskService;
        private readonly IUserActivityService _activityService;

        public TasksController(ITaskService taskService, IUserActivityService activityService)
        {
            _taskService = taskService;
            _activityService = activityService;
        }

        [HttpGet]
        [LogActivity(ActivityType.View, "Task")]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _taskService.GetAllAsync();
            return Ok(tasks);
        }

        [HttpGet("{id}")]
        [LogActivity(ActivityType.View, "Task")]
        public async Task<IActionResult> Get(int id)
        {
            var task = await _taskService.GetByIdAsync(id);
            if (task == null) return NotFound();
            return Ok(task);
        }

        [HttpGet("by-process/{ProcessId}")]
        [LogActivity(ActivityType.View, "Task")]
        public async Task<IActionResult> GetProcess(int ProcessId)
        {
            var tasks = await _taskService.GetTasksByProcessIdAsync(ProcessId);
            if (tasks == null) return NotFound();
            return Ok(tasks);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(TaskItemCreateDto dto)
        {
            dto.CreatedBy = GetCurrentUserId();

            var created = await _taskService.CreateAsync(dto);

            // Loglama
            var currentUserId = GetCurrentUserId();
            await _activityService.LogActivityAsync(currentUserId, ActivityType.Create, "Task",
                created.Id, null, created);

            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, TaskItemUpdateDto dto)
        {
            dto.UpdatedBy = GetCurrentUserId();

            var oldTask = await _taskService.GetByIdAsync(id);
            if (oldTask == null) return NotFound();

            var success = await _taskService.UpdateAsync(id, dto);
            if (!success) return BadRequest();

            var updated = await _taskService.GetByIdAsync(id);

            // Loglama
            var currentUserId = GetCurrentUserId();
            await _activityService.LogActivityAsync(currentUserId, ActivityType.Update, "Task",
                id, oldTask, updated);

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var taskToDelete = await _taskService.GetByIdAsync(id);
            if (taskToDelete == null) return NotFound(new { message = "Kayıt bulunamadı." });

            var deleted = await _taskService.DeleteAsync(id);
            if (!deleted) return BadRequest(new { message = "Silme işlemi başarısız." });

            // Loglama
            var currentUserId = GetCurrentUserId();
            await _activityService.LogActivityAsync(currentUserId, ActivityType.Delete, "Task",
                id, taskToDelete, null);

            return Ok(new { message = "Kayıt başarıyla silindi." });
        }
    }
}
