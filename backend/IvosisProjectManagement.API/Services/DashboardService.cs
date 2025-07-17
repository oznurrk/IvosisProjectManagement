using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.DTOs.Dashboard;
using IvosisProjectManagement.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IvosisProjectManagement.API.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardDto> GetDashboardDataAsync()
        {
            var now = DateTime.Now;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            var dto = new DashboardDto
            {
                TotalProjects = await _context.Projects.CountAsync(),
                TotalTasks = await _context.Tasks.CountAsync(),
                CompletedTasks = await _context.ProjectTasks.CountAsync(t => t.Status == "tamamlandı"),
                OngoingTasks = await _context.ProjectTasks.CountAsync(t => t.Status == "başladı"),
                TotalUsers = await _context.Users.CountAsync(),
                ProjectsStartedThisMonth = await _context.Projects
                    .CountAsync(p => p.CreatedAt >= startOfMonth)
            };

            return dto;
        }

        public async Task<DashboardDetailDto> GetDashboardDetailsAsync()
        {
            var userTaskStats = await _context.Users
                .Select(user => new UserTaskStatDto
                {
                    UserId = user.Id,
                    FullName = user.Name,
                    TotalTasks = _context.ProjectTasks.Count(t => t.AssignedUserId == user.Id),
                    CompletedTasks = _context.ProjectTasks.Count(t => t.AssignedUserId == user.Id && t.Status == "completed"),
                    OngoingTasks = _context.ProjectTasks.Count(t => t.AssignedUserId == user.Id && t.Status == "inProgress")
                }).ToListAsync();

            var taskStatusStats = await _context.ProjectTasks
                .GroupBy(t => t.Status)
                .Select(g => new TaskStatusStatDto
                {
                    Status = g.Key,
                    Count = g.Count()
                }).ToListAsync();

            var processTaskStats = await _context.Tasks
                .GroupBy(t => t.ProcessId)
                .Select(g => new ProcessTaskStatDto
                {
                    ProcessId = g.Key,
                    ProcessName = g.First().Title,
                    TotalTasks = g.Count()
                }).ToListAsync();

            return new DashboardDetailDto
            {
                UserTaskStats = userTaskStats,
                TaskStatusStats = taskStatusStats,
                ProcessTaskStats = processTaskStats
            };
        }

    }
}
