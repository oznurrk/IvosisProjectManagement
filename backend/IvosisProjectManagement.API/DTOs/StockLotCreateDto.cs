using System.ComponentModel.DataAnnotations;

public class StockLotCreateDto
{
    [Required]
    public int StockItemId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string LotNumber { get; set; }
    
    [StringLength(50)]
    public string? InternalLotNumber { get; set; }
    
    [StringLength(50)]
    public string? LabelNumber { get; set; }
    
    [StringLength(100)]
    public string? Barcode { get; set; }
    
    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Initial weight must be greater than 0")]
    public decimal InitialWeight { get; set; }
    
    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Initial length must be greater than 0")]
    public decimal InitialLength { get; set; }
    
    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Width must be greater than 0")]
    public decimal Width { get; set; }
    
    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Thickness must be greater than 0")]
    public decimal Thickness { get; set; }
    
    public int? SupplierId { get; set; }
    
    public DateTime? ReceiptDate { get; set; }
    
    [StringLength(100)]
    public string CertificateNumber { get; set; }
    
    [StringLength(50)]
    public string QualityGrade { get; set; }
    
    [StringLength(500)]
    public string TestResults { get; set; }
    
    public int? LocationId { get; set; }
    
    [StringLength(100)]
    public string StoragePosition { get; set; }
    
    public int? CompanyId { get; set; }
}