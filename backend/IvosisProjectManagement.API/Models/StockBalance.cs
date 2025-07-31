using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class StockBalance
    {
        public int Id { get; set; }
        
        [Required]
        public int StockItemId { get; set; }
        
        [Required]
        public int LocationId { get; set; }
        
        [Column(TypeName = "decimal(18,3)")]
        public decimal CurrentQuantity { get; set; } = 0;
        
        [Column(TypeName = "decimal(18,3)")]
        public decimal ReservedQuantity { get; set; } = 0;
        
        [Column(TypeName = "decimal(18,3)")]
        public decimal AvailableQuantity => CurrentQuantity - ReservedQuantity;
        
        public DateTime? LastMovementDate { get; set; }
        public DateTime LastUpdateDate { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("StockItemId")]
        public virtual StockItem StockItem { get; set; }
        
        [ForeignKey("LocationId")]
        public virtual StockLocation Location { get; set; }
    }