using System.ComponentModel.DataAnnotations;

public class CreateStockMovementDto
    {
        [Required]
        public int StockItemId { get; set; }
        
        [Required]
        public int LocationId { get; set; }
        
        [Required, StringLength(20)]
        public string MovementType { get; set; }= ""; // IN, OUT, TRANSFER, ADJUSTMENT
        
        [Required]
        public decimal Quantity { get; set; }
        
        public decimal UnitPrice { get; set; } = 0;
        public string ReferenceType { get; set; }= "";
        public int? ReferenceId { get; set; }
        public string ReferenceNumber { get; set; }= "";
        public string Description { get; set; }= "";
        public string Notes { get; set; }= "";
        public DateTime? MovementDate { get; set; }
    }