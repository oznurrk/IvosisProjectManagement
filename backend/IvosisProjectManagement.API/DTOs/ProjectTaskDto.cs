namespace IvosisProjectManagement.API.DTOs
{
    public class ProjectTaskDto
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
        public List<string> FilePath { get; set; }
        public List<string> FileNames =>
            FilePath?.Select(IvosisProjectManagement.API.Helpers.FileHelper.ExtractOriginalFileName).ToList() ?? new();

        public DateTime CreatedAt { get; set; }
        public int CreatedByUserId { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedByUserId { get; set; }
        public string? ProjectName { get; set; }
        public string? TaskTitle { get; set; }
        public string? ProcessName { get; set; }

    }
}
