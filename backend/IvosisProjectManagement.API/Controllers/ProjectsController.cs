using IvosisProjectManagement.API.Attributes;
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.Enums;
using IvosisProjectManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IvosisProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : BaseController
    {
        
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet]
        [LogActivity(ActivityType.View, "Project")]
        public async Task<IActionResult> GetAll()
        {
            var projects = await _projectService.GetAllAsync();
            return Ok(projects);
        }

        [HttpGet("{id}")]
        [LogActivity(ActivityType.View, "Project/id")]
        public async Task<IActionResult> GetById(int id)
        {
            var project = await _projectService.GetByIdAsync(id);
            if (project == null) return NotFound();
            return Ok(project);
        }

        [HttpPost]
        [LogActivity(ActivityType.Create, "Project")]
        public async Task<IActionResult> Create(ProjectCreateDto dto)
        {
            dto.CreatedByUserId = GetCurrentUserId();

            var created = await _projectService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        [LogActivity(ActivityType.Update, "Project")]
        public async Task<IActionResult> Update(int id, ProjectUpdateDto dto)
        {
            dto.UpdatedByUserId = GetCurrentUserId();

            var updated = await _projectService.UpdateAsync(id, dto);
            if (!updated) return NotFound();
            var result = await _projectService.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [LogActivity(ActivityType.Delete, "Project")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _projectService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return Ok(new { message = "Proje silindi." });
        }
    }
}