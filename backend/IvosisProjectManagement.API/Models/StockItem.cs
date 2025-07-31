using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class StockItem : BaseEntity
    {
        [Required, StringLength(50)]
        public string ItemCode { get; set; }
        
        [Required, StringLength(200)]
        public string Name { get; set; }
        
        [StringLength(1000)]
        public string Description { get; set; }
        
        [Required]
        public int CategoryId { get; set; }
        
        [Required]
        public int UnitId { get; set; }

        // Stock Information
        [Column(TypeName = "decimal(18,3)")]
        public decimal MinimumStock { get; set; } = 0;
        
        [Column(TypeName = "decimal(18,3)")]
        public decimal MaximumStock { get; set; } = 0;
        
        [Column(TypeName = "decimal(18,3)")]
        public decimal ReorderLevel { get; set; } = 0;

        // Price Information
        [Column(TypeName = "decimal(18,4)")]
        public decimal PurchasePrice { get; set; } = 0;
        
        [Column(TypeName = "decimal(18,4)")]
        public decimal SalePrice { get; set; } = 0;
        
        [StringLength(3)]
        public string Currency { get; set; } = "TRY";

        // Product Properties
        [StringLength(100)]
        public string Brand { get; set; }
        
        [StringLength(100)]
        public string Model { get; set; }
        
        public string Specifications { get; set; } // JSON format

        // Quality and Certificate Information
        [StringLength(500)]
        public string QualityStandards { get; set; }
        
        [StringLength(500)]
        public string CertificateNumbers { get; set; }

        // Storage Information
        [StringLength(500)]
        public string StorageConditions { get; set; }
        
        public int? ShelfLife { get; set; } // Days

        // Status Information
        public bool IsActive { get; set; } = true;
        public bool IsDiscontinued { get; set; } = false;
        public bool IsCriticalItem { get; set; } = false;

        // Navigation properties
        [ForeignKey("CategoryId")]
        public virtual StockCategory Category { get; set; }
        
        [ForeignKey("UnitId")]
        public virtual Unit Unit { get; set; }
        
        public virtual ICollection<StockBalance> StockBalances { get; set; }
        public virtual ICollection<StockMovement> StockMovements { get; set; }
        public virtual ICollection<StockAlert> StockAlerts { get; set; }
    }