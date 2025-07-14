namespace IvosisProjectManagement.API.Models
{
    public class ProjectTask
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int? ProcessId { get; set; }
        public int? TaskId { get; set; }
        public int? AssignedUserId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }
        public string? FilePath { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CreatedByUserId { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedByUserId { get; set; }
        public Project? Project { get; set; }
        public TaskItem? Task { get; set; }
        public Process? Process { get; set; }

    }
}
