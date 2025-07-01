namespace IvosisProjectManagement.API.Models
{
    public class ProjectTask
    {
        public int Id { get; set; }

        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;  // required, null olmadığından eminiz

        public int ProcessId { get; set; }
        public Process Process { get; set; } = null!;  // required

        public int TaskId { get; set; }
        public TaskItem Task { get; set; } = null!;    // required

        public int? AssignedUserId { get; set; }
        public User? AssignedUser { get; set; }

        // Boş stringle başlat
        public string Description { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
    }
}
