namespace IvosisProjectManagement.API.DTOs
{
    public class ProcessCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ParentProcessId { get; set; }
        public int? CompanyId { get; set; }
        public int CreatedBy { get; set; }
        
    }
}
