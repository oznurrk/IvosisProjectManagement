public class StockLocationDto : BaseDto
{
    public string Name { get; set; } = "";
    public string Code { get; set; } = "";
    public string Address { get; set; } = "";
    public string City { get; set; } = "";
    public string District { get; set; } = "";
    public string PostalCode { get; set; } = "";
    public string ContactPerson { get; set; } = "";
    public string ContactPhone { get; set; } = "";
    public string ContactEmail { get; set; } = "";
    public decimal? Capacity { get; set; }
    public string CapacityUnit { get; set; } = "";
    public bool IsActive { get; set; }
    public int ItemCount { get; set; }
    public decimal TotalValue { get; set; }
    public int CreatedByUserId { get; set; }
    }