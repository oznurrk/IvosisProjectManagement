namespace IvosisProjectManagement.API.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        public int ProcessId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = "ToDo"; 
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? AssignedUserId { get; set; }
    }
}
