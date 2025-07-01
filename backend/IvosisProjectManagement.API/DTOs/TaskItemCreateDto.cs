namespace IvosisProjectManagement.API.DTOs
{
    public class TaskItemCreateDto
    {
        public int ProcessId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public int? AssignedUserId { get; set; }
    }
}
