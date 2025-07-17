namespace IvosisProjectManagement.API.DTOs.Dashboard
{
    public class DashboardDto
    {
        public int TotalProjects { get; set; }
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int OngoingTasks { get; set; }
        public int TotalUsers { get; set; }
        public int ProjectsStartedThisMonth { get; set; }
    }
}
