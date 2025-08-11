using System.ComponentModel.DataAnnotations.Schema;

public class StockItem : CompanyEntity
{
    public string ItemCode { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public int CategoryId { get; set; }
    public int UnitId { get; set; }
    public decimal MinimumStock { get; set; } = 0;
    public decimal MaximumStock { get; set; } = 0;
    public decimal ReorderLevel { get; set; } = 0;
    public decimal PurchasePrice { get; set; } = 0;
    public decimal SalePrice { get; set; } = 0;
    public string Currency { get; set; } = "TRY";
    public string Brand { get; set; }
    public string Model { get; set; }
    public string Specifications { get; set; }
    public string QualityStandards { get; set; }
    public string CertificateNumbers { get; set; }
    public string StorageConditions { get; set; }
    public int? ShelfLife { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDiscontinued { get; set; } = false;
    public bool IsCriticalItem { get; set; } = false;
    public bool HasLotTracking { get; set; }  // lot takibi var mı?
    public int? MaterialNameId { get; set; }
    public int? MaterialTypeId { get; set; }
    public int? MaterialQualityId { get; set; }
    public virtual StockCategory Category { get; set; }
    public virtual Unit Unit { get; set; }
    public virtual ICollection<StockBalance> StockBalances { get; set; }
    public virtual ICollection<StockMovement> StockMovements { get; set; }
    public virtual ICollection<StockAlert> StockAlerts { get; set; }
    // Navigation property eklemek istersen:
    public MaterialName MaterialName { get; set; }
    public MaterialType MaterialType { get; set; }
    public MaterialQuality MaterialQuality { get; set; }

}