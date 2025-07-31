using System.ComponentModel.DataAnnotations;

public class Unit : BaseEntity
    {
        [Required, StringLength(50)]
        public string Name { get; set; }
        
        [Required, StringLength(10)]
        public string Code { get; set; }
        
        [StringLength(200)]
        public string Description { get; set; }
        
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<StockItem> StockItems { get; set; }
    }