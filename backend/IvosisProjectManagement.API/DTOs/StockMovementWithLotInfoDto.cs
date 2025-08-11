public class StockMovementWithLotInfoDto :CommonBaseDto
{
    public int StockItemId { get; set; }
    public string StockItemName { get; set; }
    public int LocationId { get; set; }
    public string LocationName { get; set; }
    public string MovementType { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public string ReferenceType { get; set; }
    public int? ReferenceId { get; set; }
    public string ReferenceNumber { get; set; }
    public string Description { get; set; }
    public string Notes { get; set; }
    public DateTime MovementDate { get; set; }
    public int? StockLotId { get; set; }
    
    // Lot bilgileri (JOIN ile gelecek)
    public string LotNumber { get; set; }
    public string LabelNumber { get; set; }
    public decimal? Width { get; set; }
    public decimal? Thickness { get; set; }
    public string QualityGrade { get; set; }
    
    // Production fields
    public decimal? UsedWeight { get; set; }
    public decimal? UsedLength { get; set; }
    public decimal? WastageWeight { get; set; }
    public decimal? WastageLength { get; set; }
    
}