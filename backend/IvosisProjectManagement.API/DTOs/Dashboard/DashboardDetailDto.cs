public class DashboardDetailDto
{
    public List<UserTaskStatDto> UserTaskStats { get; set; } = new();
    public List<TaskStatusStatDto> TaskStatusStats { get; set; } = new();
    public List<ProcessTaskStatDto> ProcessTaskStats { get; set; } = new();
}
