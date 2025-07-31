using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class StockCategory : BaseEntity
    {
        [Required, StringLength(100)]
        public string Name { get; set; }
        
        [Required, StringLength(20)]
        public string Code { get; set; }
        
        [StringLength(500)]
        public string Description { get; set; }
        
        public int? ParentCategoryId { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        [ForeignKey("ParentCategoryId")]
        public virtual StockCategory ParentCategory { get; set; }
        public virtual ICollection<StockCategory> SubCategories { get; set; }
        public virtual ICollection<StockItem> StockItems { get; set; }
    }