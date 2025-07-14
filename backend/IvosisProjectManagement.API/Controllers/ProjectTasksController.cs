using System.Collections;
using System.Collections.Generic;
using System.Text.Json;
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.DTOs.Common;
using IvosisProjectManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IvosisProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectTasksController : BaseController
    {
        private readonly IProjectTaskService _service;

        public ProjectTasksController(IProjectTaskService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var item = await _service.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet("by-project/{ProjectId}")]
        public async Task<IActionResult> GetProject(int ProjectId)
        {
            var item = await _service.GetTasksByProjectIdAsync(ProjectId);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetProjectTasksByUserId(int userId)
        {
            var result = await _service.GetTasksByUserIdAsync(userId);
            return Ok(Result<IList>.SuccessResult(result));
        }

        [HttpGet("my-tasks")]
        [Authorize]
        public async Task<IActionResult> GetMyTasks()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(Result<string>.Failure("Kullanıcı kimliği alınamadı."));

            var tasks = await _service.GetTasksByUserIdAsync(userId);
            return Ok(Result<IList>.SuccessResult(tasks));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] object input)
        {
            int userId = GetCurrentUserId();

            // Tek nesne mi yoksa liste mi kontrol et
            if (input is null) return BadRequest();

            var json = input.ToString();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            List<ProjectTaskCreateDto> dtos;

            if (json!.TrimStart().StartsWith("["))
            {
                // Liste
                dtos = JsonSerializer.Deserialize<List<ProjectTaskCreateDto>>(json, options)!;
            }
            else
            {
                // Tek nesne
                var single = JsonSerializer.Deserialize<ProjectTaskCreateDto>(json, options)!;
                dtos = new List<ProjectTaskCreateDto> { single };
            }

            // Hepsine CreatedByUserId ekle
            foreach (var dto in dtos)
            {
                dto.CreatedByUserId = userId;
            }

            var result = await _service.CreateManyAsync(dtos);
            return Created("api/ProjectTasks", result); 

        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ProjectTaskUpdateDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (!updated) return NotFound();
            return Ok(await _service.GetByIdAsync(id));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted ? Ok() : NotFound();
        }
    }

}
