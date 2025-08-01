using System.ComponentModel.DataAnnotations;

namespace IvosisProjectManagement.API.DTOs
{
    public class StockItemDtoCreate
    {
        [Required, StringLength(50)]
        public string ItemCode { get; set; }= "";
        
        [Required, StringLength(200)]
        public string Name { get; set; }= "";
        
        [StringLength(1000)]
        public string Description { get; set; }= "";
        
        [Required]
        public int CategoryId { get; set; }
        
        [Required]
        public int UnitId { get; set; }
        
        public int? CompanyId { get; set; }
        
        public decimal MinimumStock { get; set; } = 0;
        public decimal MaximumStock { get; set; } = 0;
        public decimal ReorderLevel { get; set; } = 0;
        public decimal PurchasePrice { get; set; } = 0;
        public decimal SalePrice { get; set; } = 0;
        public string Currency { get; set; } = "TRY";
        public string Brand { get; set; }= "";
        public string Model { get; set; }= "";
        public string Specifications { get; set; }= "";
        public string QualityStandards { get; set; }= "";
        public string CertificateNumbers { get; set; }= "";
        public string StorageConditions { get; set; }= "";
        public int? ShelfLife { get; set; }
        public bool IsCriticalItem { get; set; } = false;
    }
}