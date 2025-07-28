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
        public DateTime? EndDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public List<string> FilePath { get; set; }
        public List<string> FileNames =>
            FilePath?.Select(IvosisProjectManagement.API.Helpers.FileHelper.ExtractOriginalFileName).ToList() ?? new();
        public int CreatedByUserId { get; set; }
    }
}
