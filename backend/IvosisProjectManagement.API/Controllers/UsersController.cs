using Microsoft.AspNetCore.Mvc;
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.Services;
using Microsoft.AspNetCore.Authorization;

namespace IvosisProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);// UserDto listesi dönülür
        }

        [Authorize]
        [HttpGet("{id}")]
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
            var updated = await _userService.UpdateAsync(id, dto);
            if (!updated)
                return NotFound();

            var updatedUser = await _userService.GetByIdAsync(id);
            return Ok(updatedUser);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public IActionResult GetAdminOnlyData()
        {
            return Ok("Bu endpoint yalnızca Admin rolündeki kullanıcılar tarafından erişilebilir.");
        }
    }
}
