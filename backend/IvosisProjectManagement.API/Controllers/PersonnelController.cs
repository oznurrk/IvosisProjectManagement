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
    public class PersonnelController : BaseController
    {
        private readonly IPersonnelService _personnelService;
        private readonly IUserActivityService _activityService;

        public PersonnelController(IPersonnelService personnelService, IUserActivityService activityService)
        {
            _personnelService = personnelService;
            _activityService = activityService;
        }

        [Authorize]
        [HttpGet]
        [LogActivity(ActivityType.View, "Personnel")]
        public async Task<IActionResult> GetAll()
        {
            var personnel = await _personnelService.GetAllPersonnelAsync();
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

            return Ok(personnel);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(PersonnelCreateDto dto)
        {
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