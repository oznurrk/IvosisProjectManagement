using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IvosisProjectManagement.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectAddressesController : ControllerBase
    {
        private readonly IProjectAddressService _service;

        public ProjectAddressesController(IProjectAddressService service)
        {
            _service = service;
        }

        [HttpGet("by-project/{projectId}")]
        public async Task<IActionResult> GetByProjectId(int projectId)
        {
            var addresses = await _service.GetByProjectIdAsync(projectId);
            if (addresses == null || addresses.Count == 0)
                return NotFound("Bu projeye ait adres bulunamadı.");

            return Ok(addresses);
        }
    }
}