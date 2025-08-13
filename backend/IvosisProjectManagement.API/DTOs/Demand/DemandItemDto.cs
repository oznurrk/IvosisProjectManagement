namespace IvosisProjectManagement.API.DTOs.Demand
{
    public class DemandItemDto : BaseDto
    {
        public int DemandId { get; set; }
        
        // Product Information
        public int? StockItemId { get; set; }
        public string? StockItemCode { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string? ItemDescription { get; set; }
        public string? ItemSpecifications { get; set; }
        
        // Quantity and Unit
        public decimal RequestedQuantity { get; set; }
        public int UnitId { get; set; }
        public string UnitName { get; set; } = string.Empty;
        
        // Price Information
        public decimal? EstimatedUnitPrice { get; set; }
        public decimal? EstimatedTotalPrice { get; set; }
        public string Currency { get; set; } = "TRY";
        
        // Date Information
        public DateTime RequiredDate { get; set; }
        
        // Status Information
        public string Status { get; set; } = "PENDING";
        public string? Notes { get; set; }
        
        // Supplier Suggestion
        public int? SuggestedSupplierId { get; set; }
        public string? SuggestedSupplierName { get; set; }
    }

    public class DemandItemCreateDto
    {
        public int? StockItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string? ItemDescription { get; set; }
        public string? ItemSpecifications { get; set; }
        public decimal RequestedQuantity { get; set; }
        public int UnitId { get; set; }
        public decimal? EstimatedUnitPrice { get; set; }
        public decimal? EstimatedTotalPrice { get; set; }
        public string Currency { get; set; } = "TRY";
        public DateTime RequiredDate { get; set; }
        public string? Notes { get; set; }
        public int? SuggestedSupplierId { get; set; }
    }

    public class DemandItemUpdateDto
    {
        public string ItemName { get; set; } = string.Empty;
        public string? ItemDescription { get; set; }
        public string? ItemSpecifications { get; set; }
        public decimal RequestedQuantity { get; set; }
        public decimal? EstimatedUnitPrice { get; set; }
        public decimal? EstimatedTotalPrice { get; set; }
        public DateTime RequiredDate { get; set; }
        public string? Notes { get; set; }
        public int? SuggestedSupplierId { get; set; }
        public string Status { get; set; } = "PENDING";
    }
}