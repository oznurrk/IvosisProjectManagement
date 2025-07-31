 public class StockBalanceDto
    {
        public int StockItemId { get; set; }
        public string ItemCode { get; set; }= "";
        public string ItemName { get; set; }= "";
        public int LocationId { get; set; }
        public string LocationName { get; set; }= "";
        public decimal CurrentQuantity { get; set; }
        public decimal ReservedQuantity { get; set; }
        public decimal AvailableQuantity { get; set; }
        public DateTime? LastMovementDate { get; set; }
        public DateTime LastUpdateDate { get; set; }
        public string CategoryName { get; set; }= "";
        public string UnitName { get; set; }= "";
        public decimal MinimumStock { get; set; }
        public decimal MaximumStock { get; set; }
        public string StockStatus { get; set; }= "";
    }