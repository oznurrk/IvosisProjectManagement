namespace IvosisProjectManagement.API.Models
{
    public class TaskItem : CompanyEntity
    {
        public int ProcessId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public virtual Process? Process { get; set; }
    }
}