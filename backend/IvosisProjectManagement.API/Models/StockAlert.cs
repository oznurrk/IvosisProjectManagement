using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using IvosisProjectManagement.API.Models;

public class StockAlert
    {
        public int Id { get; set; }
        
        [Required]
        public int StockItemId { get; set; }
        
        [Required]
        public int LocationId { get; set; }
        
        [Required, StringLength(20)]
        public string AlertType { get; set; } // LOW_STOCK, OVERSTOCK, EXPIRED, QUALITY_ISSUE
        
        [Required, StringLength(10)]
        public string AlertLevel { get; set; } // INFO, WARNING, CRITICAL
        
        [Required, StringLength(500)]
        public string Message { get; set; }
        
        public bool IsRead { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? ReadAt { get; set; }
        public int? ReadBy { get; set; }

        // Navigation properties
        [ForeignKey("StockItemId")]
        public virtual StockItem StockItem { get; set; }
        
        [ForeignKey("LocationId")]
        public virtual StockLocation Location { get; set; }
        
        [ForeignKey("ReadBy")]
        public virtual User ReadByUser { get; set; }
    }