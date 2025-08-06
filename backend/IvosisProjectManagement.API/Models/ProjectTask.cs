
namespace IvosisProjectManagement.API.Models
{
    public class ProjectTask :BaseEntity
    {
        public int ProjectId { get; set; }
        public int? ProcessId { get; set; }
        public int? TaskId { get; set; }
        public int? AssignedUserId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }
        public List<string> FilePath { get; set; } = new();
        public virtual Project? Project { get; set; }
        public virtual TaskItem? Task { get; set; }
        public virtual Process? Process { get; set; }
        public virtual User? AssignedUser { get; set; }

    }
}
