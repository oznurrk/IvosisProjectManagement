namespace IvosisProjectManagement.API.DTOs
{
    public class ProjectTaskCreateDto
    {
        public int ProjectId { get; set; }
        public int ProcessId { get; set; }
        public int TaskId { get; set; }
        public int? AssignedUserId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
    }
}
