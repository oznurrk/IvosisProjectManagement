using System.ComponentModel.DataAnnotations;

namespace IvosisProjectManagement.API.Models.Demand
{
    public class DemandPriority
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string Code { get; set; } = string.Empty;
        
        public int Level { get; set; } // 1: Düşük, 2: Normal, 3: Yüksek, 4: Acil, 5: Kritik
        
        [StringLength(7)]
        public string? Color { get; set; }
        
        [StringLength(200)]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        // Navigation Properties
        public virtual ICollection<Demand> Demands { get; set; } = new List<Demand>();
    }
}