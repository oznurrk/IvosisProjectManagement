namespace IvosisProjectManagement.API.DTOs
{
    public class ProjectCreateDto
    {
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
        public decimal? AdditionalPanelPower { get; set; }
        public int? AdditionalInverterCount { get; set; }
        public int CreatedByUserId { get; set; }
        public decimal ACValue { get; set; }
        public decimal DCValue { get; set; }
        public int ProjectTypeId { get; set; }
         public List<ProjectAddressDto> Address { get; set; } = new(); // Çoklu adres
    }
}
