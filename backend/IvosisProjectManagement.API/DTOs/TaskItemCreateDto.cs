namespace IvosisProjectManagement.API.DTOs
{
    public class TaskItemCreateDto
    {
        public int ProcessId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CreatedByUserId { get; set; }
    }
}
