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
        private readonly IAuthorizationService _authService;

        public ProjectsController(IProjectService projectService, IAuthorizationService authService)
        {
            _projectService = projectService;
            _authService = authService;
        }

        [HttpGet]
        [LogActivity(ActivityType.View, "Project")]
        public async Task<IActionResult> GetAll()
        {
           var userId = GetCurrentUserId();
            
            // Grup seviyesi erişimi olanlar tüm projeleri görebilir
            if (HasGroupAccess())
            {
                var allProjects = await _projectService.GetAllAsync();
                return Ok(allProjects);
            }
            
            // Diğerleri sadece erişebildikleri firmaların projelerini görebilir
            var accessibleCompanies = await _authService.GetUserAccessibleCompaniesAsync(userId);
            var projects = await _projectService.GetProjectsByCompaniesAsync(accessibleCompanies);
            
            return Ok(projects);
        }
        
        [HttpGet("production-only")]
        [LogActivity(ActivityType.View, "Project/Production")]
        public async Task<IActionResult> GetProductionProjects()
        {
            var userId = GetCurrentUserId();
            
            // Sadece üretim rolü olanlar görebilir
            if (!GetCurrentUserRoles().Contains("PRODUCTION_MANAGER"))
                return Forbid("Üretim projelerini görme yetkiniz yok.");

            var companyId = GetCurrentCompanyId();
            if (!companyId.HasValue)
                return BadRequest("Firma bilgisi bulunamadı.");

            // Sadece çelik firması projelerini döndür (örnek: CompanyId = 1)
            if (companyId.Value != 1) // Çelik firması ID'si
                return Forbid("Sadece çelik firması üretim projelerini görebilirsiniz.");

            var projects = await _projectService.GetProductionProjectsAsync(companyId.Value);
            return Ok(projects);
        }

        [HttpGet("energy-only")]
        [LogActivity(ActivityType.View, "Project/Energy")]
        public async Task<IActionResult> GetEnergyProjects()
        {
            var userId = GetCurrentUserId();
            var companyId = GetCurrentCompanyId();
            
            // Sadece enerji firması projelerini döndür (örnek: CompanyId = 2)
            if (companyId.HasValue && companyId.Value == 2) // Enerji firması ID'si
            {
                var projects = await _projectService.GetProjectsByCompanyAsync(companyId.Value);
                return Ok(projects);
            }
            
            // Grup erişimi olanlar da görebilir
            if (HasGroupAccess())
            {
                var energyProjects = await _projectService.GetProjectsByCompanyAsync(2);
                return Ok(energyProjects);
            }
            
            return Forbid("Enerji projelerini görme yetkiniz yok.");
        }

        [HttpGet("{id}")]
        [LogActivity(ActivityType.View, "Project/id")]
        public async Task<IActionResult> GetById(int id)
        {
            var project = await _projectService.GetByIdAsync(id);
            if (project == null) return NotFound();
            
            var userId = GetCurrentUserId();
            
            // Yetki kontrolü
            if (!HasGroupAccess() && project.CompanyId.HasValue)
            {
                if (!await _authService.CanUserAccessCompanyAsync(userId, project.CompanyId.Value))
                    return Forbid("Bu projeye erişim yetkiniz yok.");
            }
            
            return Ok(project);
        }

        [HttpPost]
        [LogActivity(ActivityType.Create, "Project")]
        public async Task<IActionResult> Create(ProjectCreateDto dto)
        {
            var userId = GetCurrentUserId();
            dto.CreatedByUserId = userId;
            
            // CompanyId kontrolü - eğer belirtilmemişse kullanıcının firmasını kullan
            if (!dto.CompanyId.HasValue)
            {
                dto.CompanyId = GetCurrentCompanyId();
            }
            
            // Yetki kontrolü
            if (dto.CompanyId.HasValue && !HasGroupAccess())
            {
                if (!await _authService.CanUserAccessCompanyAsync(userId, dto.CompanyId.Value))
                    return Forbid("Bu firmaya proje ekleme yetkiniz yok.");
            }

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