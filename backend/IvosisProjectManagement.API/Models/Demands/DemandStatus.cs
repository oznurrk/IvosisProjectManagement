using System.ComponentModel.DataAnnotations;

namespace IvosisProjectManagement.API.Models.Demand
{
    public class DemandStatus
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string Code { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [StringLength(7)]
        public string? Color { get; set; } // HEX color code
        
        public int SortOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public int? CreatedBy { get; set; }
        
        // Navigation property
        public virtual User? CreatedByUser { get; set; }
        public virtual ICollection<Demand> Demands { get; set; } = new List<Demand>();
    }
}