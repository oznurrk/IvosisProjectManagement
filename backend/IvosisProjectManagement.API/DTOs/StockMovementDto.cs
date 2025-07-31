namespace IvosisProjectManagement.API.DTOs
{
    public class StockMovementDto
    {
        public int Id { get; set; }
        public int StockItemId { get; set; }
        public string ItemCode { get; set; }= "";
        public string ItemName { get; set; }= "";
        public int LocationId { get; set; }
        public string LocationName { get; set; }= "";
        public string MovementType { get; set; }= "";
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalAmount { get; set; }
        public string ReferenceType { get; set; }= "";
        public int? ReferenceId { get; set; }
        public string ReferenceNumber { get; set; }= "";
        public string Description { get; set; }= "";
        public string Notes { get; set; }= "";
        public DateTime MovementDate { get; set; }
        public string CategoryName { get; set; }= "";
        public DateTime CreatedAt { get; set; }
        public int CreatedBy { get; set; }
        public string CreatedByName { get; set; }= "";
    }
}