namespace IvosisProjectManagement.API.Models
{
    public class ProcessCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ParentProcessId { get; set; }
    }
}
