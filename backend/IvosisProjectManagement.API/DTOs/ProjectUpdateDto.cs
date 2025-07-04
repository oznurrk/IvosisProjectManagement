namespace IvosisProjectManagement.API.DTOs
{
    public class ProjectUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int UpdatedByUserId { get; set; }
    }
}
