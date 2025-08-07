namespace IvosisProjectManagement.API.DTOs
{
    public class ProcessUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
