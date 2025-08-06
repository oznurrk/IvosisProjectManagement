namespace IvosisProjectManagement.API.Models
{
    public class Process : CompanyEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? ParentProcessId { get; set; }
        public virtual Process? ParentProcess { get; set; }
    }
}
