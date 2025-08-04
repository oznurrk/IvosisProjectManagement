using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using IvosisProjectManagement.API.Models;

public class StockAlert
    {
        public int Id { get; set; }
        public int StockItemId { get; set; }
        public int LocationId { get; set; }
        public string AlertType { get; set; } // LOW_STOCK, OVERSTOCK, EXPIRED, QUALITY_ISSUE
        public string AlertLevel { get; set; } // INFO, WARNING, CRITICAL
        public string Message { get; set; }
        public bool IsRead { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? ReadAt { get; set; }
        public int? ReadBy { get; set; }

        // Navigation properties - ForeignKey attribute'ları KALDıRıLDı
        public virtual StockItem StockItem { get; set; }
        public virtual StockLocation Location { get; set; }
        public virtual User ReadByUser { get; set; }
    }