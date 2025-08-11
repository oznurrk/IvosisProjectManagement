public class StockLotListDto:CommonBaseDto
{
    public string LotNumber { get; set; }
    public string LabelNumber { get; set; }
    public string StockItemName { get; set; }
    public decimal CurrentWeight { get; set; }
    public decimal CurrentLength { get; set; }
    public decimal Width { get; set; }
    public decimal Thickness { get; set; }
    public string QualityGrade { get; set; }
    public string LocationName { get; set; }
    public string Status { get; set; }
    public bool IsBlocked { get; set; }
}