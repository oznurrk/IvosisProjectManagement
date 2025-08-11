public class StockMovement : CompanyEntity
{
    public int StockItemId { get; set; }
    public int LocationId { get; set; }
    public string MovementType { get; set; } // IN, OUT, TRANSFER, ADJUSTMENT
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; } = 0;
    public decimal TotalAmount { get; set; } = 0;
    public string ReferenceType { get; set; } // PURCHASE, SALE, PRODUCTION, ADJUSTMENT
    public int? ReferenceId { get; set; }
    public string ReferenceNumber { get; set; }
    public string Description { get; set; }
    public string Notes { get; set; }
    public DateTime MovementDate { get; set; } = DateTime.Now;
    public int? StockLotId { get; set; }
    public virtual StockLot StockLot { get; set; }
    public virtual StockItem StockItem { get; set; }
    public virtual StockLocation Location { get; set; }
}