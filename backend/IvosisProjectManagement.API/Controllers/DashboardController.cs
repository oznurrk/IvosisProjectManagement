using IvosisProjectManagement.API.DTOs.Common;
using IvosisProjectManagement.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IvosisProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetDashboardData()
        {
            var result = await _dashboardService.GetDashboardDataAsync();
            return Ok(result);
        }

        [HttpGet("details")]
        [Authorize]
        public async Task<IActionResult> GetDashboardDetails()
        {
            var data = await _dashboardService.GetDashboardDetailsAsync();
            return Ok(new Result<DashboardDetailDto>
            {
                Success = true,
                Message = "Dashboard detayları getirildi.",
                Data = data
            });
        }
    }
}
