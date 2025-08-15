using System.ComponentModel.DataAnnotations;

public class StockLotUpdateDto
{
    [StringLength(50)]
    public string? InternalLotNumber { get; set; }
    
    [StringLength(50)]
    public string? LabelNumber { get; set; }
    
    [StringLength(100)]
    public string? Barcode { get; set; }
    
    [StringLength(100)]
    public string? CertificateNumber { get; set; }
    
    [StringLength(50)]
    public string QualityGrade { get; set; }
    
    [StringLength(500)]
    public string TestResults { get; set; }
    
    public int? LocationId { get; set; }
    
    [StringLength(100)]
    public string StoragePosition { get; set; }
    
    [StringLength(20)]
    public string Status { get; set; }
    
    public bool? IsBlocked { get; set; }
    
    [StringLength(250)]
    public string BlockReason { get; set; }
}