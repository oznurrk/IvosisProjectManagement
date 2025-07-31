using IvosisProjectManagement.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardStockController : ControllerBase
    {
        private readonly IDashboardStockService _dashboardService;

        public DashboardStockController(IDashboardStockService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetDashboardStats()
        {
            try
            {
                var stats = await _dashboardService.GetDashboardStatsAsync();
                return Ok(new { success = true, data = stats });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("recent-movements")]
        public async Task<ActionResult<object>> GetRecentMovements([FromQuery] int take = 10)
        {
            try
            {
                var movements = await _dashboardService.GetRecentMovementsAsync(take);
                return Ok(new { success = true, data = movements });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("recent-alerts")]
        public async Task<ActionResult<object>> GetRecentAlerts([FromQuery] int take = 5)
        {
            try
            {
                var alerts = await _dashboardService.GetRecentAlertsAsync(take);
                return Ok(new { success = true, data = alerts });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }