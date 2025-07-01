namespace IvosisProjectManagement.API.Models
{
    public class ProjectTask
    {
        public int Id { get; set; }

        public int ProcessId { get; set; }
        public Process Process { get; set; } 

        public string Title { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public int? AssignedUserId { get; set; }
        public User? AssignedUser { get; set; }
    }
}