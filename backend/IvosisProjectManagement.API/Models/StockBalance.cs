using System.ComponentModel.DataAnnotations.Schema;

public class StockBalance : CompanyEntity
    {
        public int StockItemId { get; set; }
        public int LocationId { get; set; }
        public decimal CurrentQuantity { get; set; } = 0;
        public decimal ReservedQuantity { get; set; } = 0;
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public decimal AvailableQuantity { get; set; }
        
        public DateTime? LastMovementDate { get; set; }
        public DateTime LastUpdateDate { get; set; } = DateTime.Now;

        // Navigation properties
        public virtual StockItem StockItem { get; set; }
        public virtual StockLocation Location { get; set; }
        
    }