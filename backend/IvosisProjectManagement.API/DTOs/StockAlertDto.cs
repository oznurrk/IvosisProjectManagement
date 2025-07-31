 public class StockAlertDto
    {
        public int Id { get; set; }
        public int StockItemId { get; set; }
        public string ItemCode { get; set; }= "";
        public string ItemName { get; set; }= "";
        public int LocationId { get; set; }
        public string LocationName { get; set; }= "";
        public string AlertType { get; set; }= "";
        public string AlertLevel { get; set; }= "";
        public string Message { get; set; }= "";
        public bool IsRead { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public int? ReadBy { get; set; }
        public string ReadByName { get; set; }= "";
    }