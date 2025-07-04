namespace IvosisProjectManagement.API.DTOs
{
    public class ProjectTaskCreateDto
    {
        public int ProjectId { get; set; }
        public int ProcessId { get; set; }
        public int TaskId { get; set; }
        public int AssignedUserId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? FilePath { get; set; }
        public int CreatedByUserId { get; set; }
    }
}
