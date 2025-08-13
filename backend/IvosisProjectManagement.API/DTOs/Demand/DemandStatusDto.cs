namespace IvosisProjectManagement.API.DTOs.Demand
{
    public class DemandStatusDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
    }

    public class DemandStatusCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public int SortOrder { get; set; } = 0;
    }

    public class DemandPriorityDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int Level { get; set; }
        public string? Color { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }
}