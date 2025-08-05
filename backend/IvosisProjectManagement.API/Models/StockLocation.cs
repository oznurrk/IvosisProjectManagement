using IvosisProjectManagement.API.Models;

public class StockLocation : BaseEntity
{
    public string Name { get; set; }
    public string Code { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string District { get; set; }
    public string PostalCode { get; set; }
    public string ContactPerson { get; set; }
    public string ContactPhone { get; set; }
    public string ContactEmail { get; set; }
    public decimal? Capacity { get; set; }
    public string CapacityUnit { get; set; }
    public bool IsActive { get; set; } = true;
    public int CreatedByUserId { get; set; }
    public int UpdatedByUserId { get; set; }
    // Navigation properties - ForeignKey attribute'ları KALDıRıLDı
    public User CreatedByUser { get; set; }
    public virtual ICollection<StockBalance> StockBalances { get; set; }
    public virtual ICollection<StockMovement> StockMovements { get; set; }
}