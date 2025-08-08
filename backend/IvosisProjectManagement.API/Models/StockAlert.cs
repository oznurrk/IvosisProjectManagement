using System.ComponentModel.DataAnnotations.Schema;
using IvosisProjectManagement.API.Models;

public class StockAlert : CompanyEntity
{
    public int StockItemId { get; set; }
    public int LocationId { get; set; }
    public string AlertType { get; set; } // LOW_STOCK, OVERSTOCK, EXPIRED, QUALITY_ISSUE
    public string AlertLevel { get; set; } // INFO, WARNING, CRITICAL
    public string Message { get; set; }
    public bool IsRead { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime? ReadAt { get; set; }
    public int? ReadBy { get; set; }
    public virtual StockItem StockItem { get; set; }
    public virtual StockLocation Location { get; set; }
    
    [ForeignKey("ReadBy")]
    public virtual User? ReadByUser { get; set; } 
    }