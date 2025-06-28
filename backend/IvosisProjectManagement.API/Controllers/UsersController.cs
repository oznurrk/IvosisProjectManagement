using Microsoft.AspNetCore.Mvc;
using IvosisProjectManagement.API.Models;
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
            return Ok(users);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }   

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] User user)
        {
            var createdUser = await _userService.CreateUserAsync(user);
            return CreatedAtAction(nameof(GetById), new { id = createdUser.Id }, createdUser);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] User user)
        {
            if (id != user.Id) return BadRequest();

            var updated = await _userService.UpdateAsync(user);

            if (!updated)
                return NotFound();

            var updatedProcess = await _userService.GetByIdAsync(id);
            return Ok(updatedProcess); // 200 OK + body
        }

        //Sadece Admin'in görebileceği özel alan
        [Authorize]
        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public IActionResult GetAdminOnlyData()
        {
            return Ok("Bu endpoint yalnızca Admin rolündeki kullanıcılar tarafından erişilebilir.");
        }
    }
}
