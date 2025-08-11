using System.ComponentModel.DataAnnotations;

public class StockLotResponseDto : CompanyDto
{
    public int StockItemId { get; set; }
    public string LotNumber { get; set; }
    public string InternalLotNumber { get; set; }
    public string LabelNumber { get; set; }
    public string Barcode { get; set; }
    public decimal InitialWeight { get; set; }
    public decimal CurrentWeight { get; set; }
    public decimal InitialLength { get; set; }
    public decimal CurrentLength { get; set; }
    public decimal Width { get; set; }
    public decimal Thickness { get; set; }
    public int? SupplierId { get; set; }
    public DateTime? ReceiptDate { get; set; }
    public string CertificateNumber { get; set; }
    public string QualityGrade { get; set; }
    public string TestResults { get; set; }
    public int? LocationId { get; set; }
    public string StoragePosition { get; set; }
    public string Status { get; set; }
    public bool IsBlocked { get; set; }
    public string BlockReason { get; set; }

    // Navigation Properties
    public string StockItemName { get; set; }
    public string SupplierName { get; set; }
    public string LocationName { get; set; }
}