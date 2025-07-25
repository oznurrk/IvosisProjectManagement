using Microsoft.AspNetCore.Mvc;
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using IvosisProjectManagement.API.Services.Interfaces;
using IvosisProjectManagement.API.Attributes;
using IvosisProjectManagement.API.Enums;

namespace IvosisProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : BaseController
    {
        private readonly IUserService _userService;
        private readonly IUserActivityService _activityService;

        public UsersController(IUserService userService, IUserActivityService activityService)
        {
            _userService = userService;
            _activityService = activityService;
        }

        [Authorize]
        [HttpGet]
        [LogActivity(ActivityType.View, "User")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);// UserDto listesi dönülür
        }

        [Authorize]
        [HttpGet("{id}")]
        [LogActivity(ActivityType.View, "User")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user);// UserDto listesi dönülür
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(UserRegisterDto dto)
        {
           var createdUser = await _userService.CreateUserAsync(dto);
            if (createdUser == null)
                return BadRequest("Kullanıcı oluşturulamadı.");

            // Loglama
            var currentUserId = GetCurrentUserId();
            await _activityService.LogActivityAsync(currentUserId, ActivityType.Create, "User",
                createdUser.Id, null, createdUser);

            var userDto = new UserDto
            {
                Id = createdUser.Id,
                Name = createdUser.Name,
                Email = createdUser.Email,
                Role = createdUser.Role
            };
            return CreatedAtAction(nameof(GetById), new { id = userDto.Id }, userDto);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UserUpdateDto dto)
        {
            var oldUser = await _userService.GetByIdAsync(id);
            if (oldUser == null)
                return NotFound();

            var updated = await _userService.UpdateAsync(id, dto);
            if (!updated)
                return BadRequest("Güncelleme başarısız.");

            var updatedUser = await _userService.GetByIdAsync(id);

            // Loglama
            var currentUserId = GetCurrentUserId();
            await _activityService.LogActivityAsync(currentUserId, ActivityType.Update, "User",
                id, oldUser, updatedUser);

            return Ok(updatedUser);
        }

        /*[Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userToDelete = await _userService.GetByIdAsync(id);
            if (userToDelete == null)
                return NotFound();

            var deleted = await _userService.DeleteAsync(id);
            if (!deleted)
                return BadRequest("Silme işlemi başarısız.");

            // Loglama
            var currentUserId = GetCurrentUserId();
            await _activityService.LogActivityAsync(currentUserId, ActivityType.Delete, "User",
                id, userToDelete, null);

            return Ok("Kullanıcı silindi.");
        }*/


        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public IActionResult GetAdminOnlyData()
        {
            return Ok("Bu endpoint yalnızca Admin rolündeki kullanıcılar tarafından erişilebilir.");
        }
    }
}
