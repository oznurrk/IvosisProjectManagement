namespace IvosisProjectManagement.API.DTOs
{
    public class ProcessDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ParentProcessId { get; set; }
    }
}
