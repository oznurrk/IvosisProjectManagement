using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.Services.Interfaces;
using IvosisProjectManagement.API.Attributes;
using IvosisProjectManagement.API.Enums;

namespace IvosisProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PersonnelController : BaseController
    {
        private readonly IPersonnelService _personnelService;
        private readonly IUserActivityService _activityService;
        private readonly IAuthorizationService _authService;

        public PersonnelController(IPersonnelService personnelService, IUserActivityService activityService, IAuthorizationService authService)
        {
            _personnelService = personnelService;
            _activityService = activityService;
            _authService = authService;
        }

        [Authorize]
        [HttpGet]
        [LogActivity(ActivityType.View, "Personnel")]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetCurrentUserId();
            
            // İK Müdürü tüm personeli görebilir
            if (HasGroupAccess() || GetCurrentUserRoles().Contains("HR_MANAGER"))
            {
                var allPersonnel = await _personnelService.GetAllPersonnelAsync();
                return Ok(allPersonnel);
            }
            
            // Diğer kullanıcılar sadece erişebildikleri firmaların personelini görebilir
            var accessibleCompanies = await _authService.GetUserAccessibleCompaniesAsync(userId);
            var personnel = await _personnelService.GetPersonnelByCompaniesAsync(accessibleCompanies);
            
            return Ok(personnel);
        }

        [HttpGet("my-department")]
        [LogActivity(ActivityType.View, "Personnel/MyDepartment")]
        public async Task<IActionResult> GetMyDepartmentPersonnel()
        {
            var departmentId = GetCurrentDepartmentId();
            if (!departmentId.HasValue)
                return BadRequest("Departman bilgisi bulunamadı.");

            var personnel = await _personnelService.GetPersonnelByDepartmentAsync(departmentId.Value);
            return Ok(personnel);
        }

        [Authorize]
        [HttpGet("{id}")]
        [LogActivity(ActivityType.View, "Personnel")]
        public async Task<IActionResult> GetById(int id)
        {
            var personnel = await _personnelService.GetByIdAsync(id);
            if (personnel == null)
                return NotFound();

            var userId = GetCurrentUserId();
            
            // Yetki kontrolü
            if (!HasGroupAccess() && personnel.CompanyId.HasValue)
            {
                if (!await _authService.CanUserAccessCompanyAsync(userId, personnel.CompanyId.Value))
                    return StatusCode(403, new { success = false, message = "Bu personel bilgisine erişim yetkiniz yok." });
                    
            }

            return Ok(personnel);
        }

        [Authorize]
        [HttpGet("sicil/{sicilNo}")]
        [LogActivity(ActivityType.View, "Personnel")]
        public async Task<IActionResult> GetBySicilNo(string sicilNo)
        {
            var personnel = await _personnelService.GetBySicilNoAsync(sicilNo);
            if (personnel == null)
                return NotFound();

            var userId = GetCurrentUserId();

            if(!HasGroupAccess() && personnel.CompanyId.HasValue)
            {
                if (!await _authService.CanUserAccessCompanyAsync(userId, personnel.CompanyId.Value))
                    return StatusCode(403, new { success = false, message = "Bu personel bilgisine erişim yetkiniz yok." });
            }

            return Ok(personnel);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(PersonnelCreateDto dto)
        {
            var userId = GetCurrentUserId();
             // CompanyId kontrolü - eğer belirtilmemişse kullanıcının firmasını kullan
            if (!dto.CompanyId.HasValue)
            {
                dto.CompanyId = GetCurrentCompanyId();
            }
            
            // Yetki kontrolü
            if (dto.CompanyId.HasValue && !HasGroupAccess())
            {
                if (!await _authService.CanUserAccessCompanyAsync(userId, dto.CompanyId.Value))
                    return StatusCode(403, new { success = false, message = "Bu firmaya personel ekleme yetkiniz yok." });
            }
            // Validations
            if (await _personnelService.SicilNoExistsAsync(dto.SicilNo))
                return BadRequest("Bu sicil numarası zaten kullanılıyor.");

            if (!string.IsNullOrWhiteSpace(dto.TCKimlikNo) && await _personnelService.TCKimlikNoExistsAsync(dto.TCKimlikNo))
                return BadRequest("Bu TC Kimlik numarası zaten kayıtlı.");

            if (!string.IsNullOrWhiteSpace(dto.Email) && await _personnelService.EmailExistsAsync(dto.Email))
                return BadRequest("Bu e-posta adresi zaten kayıtlı.");

            var createdPersonnel = await _personnelService.CreatePersonnelAsync(dto);
            if (createdPersonnel == null)
                return BadRequest("Personel oluşturulamadı.");

            // Loglama
            var currentUserId = GetCurrentUserId();
            await _activityService.LogActivityAsync(currentUserId, ActivityType.Create, "Personnel",
                createdPersonnel.Id, null, createdPersonnel);

            return CreatedAtAction(nameof(GetById), new { id = createdPersonnel.Id }, createdPersonnel);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, PersonnelUpdateDto dto)
        {
            var userId = GetCurrentUserId();
             // CompanyId kontrolü - eğer belirtilmemişse kullanıcının firmasını kullan
            if (!dto.CompanyId.HasValue)
            {
                dto.CompanyId = GetCurrentCompanyId();
            }
            
            // Yetki kontrolü
            if (dto.CompanyId.HasValue && !HasGroupAccess())
            {
                if (!await _authService.CanUserAccessCompanyAsync(userId, dto.CompanyId.Value))
                    return StatusCode(403, new { success = false, message = "Bu firmaya personel ekleme yetkiniz yok." });
            }
            var oldPersonnel = await _personnelService.GetByIdAsync(id);
            if (oldPersonnel == null)
                return NotFound();

            // Check if sicil no is being changed and if new one exists
            if (oldPersonnel.SicilNo != dto.SicilNo && await _personnelService.SicilNoExistsAsync(dto.SicilNo))
                return BadRequest("Bu sicil numarası zaten kullanılıyor.");

            // Check TC Kimlik No
            if (!string.IsNullOrWhiteSpace(dto.TCKimlikNo) && oldPersonnel.TCKimlikNo != dto.TCKimlikNo &&
                await _personnelService.TCKimlikNoExistsAsync(dto.TCKimlikNo))
                return BadRequest("Bu TC Kimlik numarası zaten kayıtlı.");

            // Check Email
            if (!string.IsNullOrWhiteSpace(dto.Email) && oldPersonnel.Email != dto.Email &&
                await _personnelService.EmailExistsAsync(dto.Email))
                return BadRequest("Bu e-posta adresi zaten kayıtlı.");

            var updated = await _personnelService.UpdateAsync(id, dto);
            if (!updated)
                return BadRequest("Güncelleme başarısız.");

            var updatedPersonnel = await _personnelService.GetByIdAsync(id);

            // Loglama
            var currentUserId = GetCurrentUserId();
            await _activityService.LogActivityAsync(currentUserId, ActivityType.Update, "Personnel",
                id, oldPersonnel, updatedPersonnel);

            return Ok(updatedPersonnel);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var personnelToDelete = await _personnelService.GetByIdAsync(id);
            if (personnelToDelete == null)
                return NotFound();

            var deleted = await _personnelService.DeleteAsync(id);
            if (!deleted)
                return BadRequest("Silme işlemi başarısız.");

            // Loglama
            var currentUserId = GetCurrentUserId();
            await _activityService.LogActivityAsync(currentUserId, ActivityType.Delete, "Personnel",
                id, personnelToDelete, null);

            return Ok("Personel silindi.");
        }
    }
}