using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using IvosisProjectManagement.API.Models;

public class StockLot : CompanyEntity
{
    public int StockItemId { get; set; }
    
    //[Required]
    [StringLength(50)]
    public string? LotNumber { get; set; }
    
    [StringLength(50)]
    public string? InternalLotNumber { get; set; }
    
    [StringLength(50)]
    public string? LabelNumber { get; set; }
    
    [StringLength(100)]
    public string? Barcode { get; set; }
    
    [Column(TypeName = "decimal(18,4)")]
    public decimal InitialWeight { get; set; }
    
    [Column(TypeName = "decimal(18,4)")]
    public decimal CurrentWeight { get; set; }
    
    [Column(TypeName = "decimal(18,4)")]
    public decimal InitialLength { get; set; }
    
    [Column(TypeName = "decimal(18,4)")]
    public decimal CurrentLength { get; set; }
    
    [Column(TypeName = "decimal(18,4)")]
    public decimal Width { get; set; }
    
    [Column(TypeName = "decimal(18,4)")]
    public decimal Thickness { get; set; }
    
    public int? SupplierId { get; set; }
    
    public DateTime? ReceiptDate { get; set; }
    
    [StringLength(100)]
    public string? CertificateNumber { get; set; }
    
    [StringLength(50)]
    public string? QualityGrade { get; set; }
    
    [StringLength(500)]
    public string TestResults { get; set; }
    
    public int? LocationId { get; set; }
    
    [StringLength(100)]
    public string StoragePosition { get; set; }
    
    //[Required]
    [StringLength(20)]
    public string? Status { get; set; } = "ACTIVE"; // ACTIVE, CONSUMED, BLOCKED
    
    public bool IsBlocked { get; set; } = false;
    
    [StringLength(250)]
    public string? BlockReason { get; set; }

    // Navigation Properties
    public virtual StockItem StockItem { get; set; }
    public virtual Supplier Supplier { get; set; }
    public virtual StockLocation Location { get; set; }
    public virtual ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}