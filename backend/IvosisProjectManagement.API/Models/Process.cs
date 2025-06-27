namespace IvosisProjectManagement.API.Models
{
    public class Process
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? ParentProcessId { get; set; }
    }
}
