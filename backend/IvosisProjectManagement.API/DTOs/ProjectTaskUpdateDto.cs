namespace IvosisProjectManagement.API.DTOs
{
    public class ProjectTaskUpdateDto
    {
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public int AssignedUserId { get; set; }
        public DateTime? EndDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public List<string> FilePath { get; set; }
        public int UpdatedByUserId { get; set; }
    }
}
