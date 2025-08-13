using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IvosisProjectManagement.API.Models.Demand
{
    public class DemandItem : BaseEntity
    {
        [Required]
        public int DemandId { get; set; }
        
        // Ürün Bilgileri
        public int? StockItemId { get; set; } // Mevcut stok kalemi varsa
        
        [Required]
        [StringLength(200)]
        public string ItemName { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string? ItemDescription { get; set; }
        
        public string? ItemSpecifications { get; set; } // JSON format
        
        // Miktar ve Birim Bilgileri
        [Column(TypeName = "decimal(18,3)")]
        public decimal RequestedQuantity { get; set; }
        
        [Required]
        public int UnitId { get; set; }
        
        // Fiyat Bilgileri
        [Column(TypeName = "decimal(18,4)")]
        public decimal? EstimatedUnitPrice { get; set; }
        
        [Column(TypeName = "decimal(18,4)")]
        public decimal? EstimatedTotalPrice { get; set; }
        
        [StringLength(3)]
        public string Currency { get; set; } = "TRY";
        
        // Tarih Bilgileri
        public DateTime RequiredDate { get; set; }
        
        // Durum Bilgileri
        [StringLength(50)]
        public string Status { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED, ORDERED
        
        [StringLength(1000)]
        public string? Notes { get; set; }
        
        // Tedarikçi Önerisi
        public int? SuggestedSupplierId { get; set; }
        
        // Navigation Properties
        [ForeignKey("DemandId")]
        public virtual Demand Demand { get; set; } = null!;
        
        [ForeignKey("StockItemId")]
        public virtual StockItem? StockItem { get; set; }
        
        [ForeignKey("UnitId")]
        public virtual Unit Unit { get; set; } = null!;
        
        [ForeignKey("SuggestedSupplierId")]
        public virtual Supplier? SuggestedSupplier { get; set; }
    }
}
