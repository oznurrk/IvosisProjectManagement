using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using IvosisProjectManagement.API.Models;

public class StockMovement
    {
        public int Id { get; set; }
        
        [Required]
        public int StockItemId { get; set; }
        
        [Required]
        public int LocationId { get; set; }
        
        [Required, StringLength(20)]
        public string MovementType { get; set; } // IN, OUT, TRANSFER, ADJUSTMENT
        
        [Column(TypeName = "decimal(18,3)")]
        public decimal Quantity { get; set; }
        
        [Column(TypeName = "decimal(18,4)")]
        public decimal UnitPrice { get; set; } = 0;
        
        [Column(TypeName = "decimal(18,4)")]
        public decimal TotalAmount { get; set; } = 0;

        // Reference Information
        [StringLength(50)]
        public string ReferenceType { get; set; } // PURCHASE, SALE, PRODUCTION, ADJUSTMENT
        
        public int? ReferenceId { get; set; }
        
        [StringLength(50)]
        public string ReferenceNumber { get; set; }

        // Description and Notes
        [StringLength(500)]
        public string Description { get; set; }
        
        [StringLength(1000)]
        public string Notes { get; set; }

        // Date Information
        public DateTime MovementDate { get; set; } = DateTime.Now;

        // Audit Information
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public int CreatedBy { get; set; }

        // Navigation properties
        [ForeignKey("StockItemId")]
        public virtual StockItem StockItem { get; set; }
        
        [ForeignKey("LocationId")]
        public virtual StockLocation Location { get; set; }
        
        [ForeignKey("CreatedBy")]
        public virtual User CreatedByUser { get; set; }
    }