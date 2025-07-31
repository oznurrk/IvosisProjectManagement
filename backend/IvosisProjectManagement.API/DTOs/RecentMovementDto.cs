public class RecentMovementDto
    {
        public int Id { get; set; }
        public string ItemCode { get; set; }= "";
        public string ItemName { get; set; }= "";
        public string MovementType { get; set; }= "";
        public decimal Quantity { get; set; }
        public string LocationName { get; set; }= "";
        public DateTime MovementDate { get; set; }
        public string CreatedByName { get; set; }= "";
        public string Description { get; set; }= "";
    }