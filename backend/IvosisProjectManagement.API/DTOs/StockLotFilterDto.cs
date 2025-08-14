public class StockLotFilterDto
{
    public int? StockItemId { get; set; }
    public string? LotNumber { get; set; }
    public string? LabelNumber { get; set; }
    public int? SupplierId { get; set; }
    public int? LocationId { get; set; }
    public string? Status { get; set; }
    public bool? IsBlocked { get; set; }
    public string? QualityGrade { get; set; }
    public DateTime? ReceiptDateFrom { get; set; }
    public DateTime? ReceiptDateTo { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "CreatedAt";
    public string SortDirection { get; set; } = "desc";
}