namespace IvosisProjectManagement.API.DTOs
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? PanelCount { get; set; }
        public decimal? PanelPower { get; set; }
        public int? PanelBrandId { get; set; }
        public int? InverterCount { get; set; }
        public decimal? InverterPower { get; set; }
        public int? InverterBrandId { get; set; }
        public bool? HasAdditionalStructure { get; set; }
        public int? AdditionalPanelCount { get; set; }
        public int? AdditionalInverterCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CreatedByUserId { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int UpdatedByUserId { get; set; }
        public decimal? ACValue { get; set; }
        public decimal? DCValue { get; set; }
        public int? CityId { get; set; }
        public string CityName { get; set; }
        public int? DistrictId { get; set; }
        public string DistrictName { get; set; }
        public int? NeighborhoodId { get; set; }
        public string NeighborhoodName { get; set; }
        public string Ada { get; set; }
        public string Parsel { get; set; }
        public int? ProjectTypeId { get; set; }
        public string ProjectTypeName { get; set; }
    }
}
