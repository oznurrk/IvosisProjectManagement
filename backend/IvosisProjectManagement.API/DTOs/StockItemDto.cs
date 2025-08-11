public class StockItemDto : CompanyDto
    {
        public string ItemCode { get; set; } = "";
        public string Name { get; set; }= "";
        public string Description { get; set; }= "";
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }= "";
        public int UnitId { get; set; }
        public string UnitName { get; set; } = "";
        public decimal MinimumStock { get; set; }
        public decimal MaximumStock { get; set; }
        public decimal ReorderLevel { get; set; }
        public decimal PurchasePrice { get; set; }
        public decimal SalePrice { get; set; }
        public string Currency { get; set; }= "";
        public string Brand { get; set; }= "";
        public string Model { get; set; }= "";
        public string Specifications { get; set; }= "";
        public string QualityStandards { get; set; }= "";
        public string CertificateNumbers { get; set; }= "";
        public string StorageConditions { get; set; }= "";
        public int? ShelfLife { get; set; }
        public bool IsActive { get; set; }
        public bool IsDiscontinued { get; set; }
        public bool IsCriticalItem { get; set; }
        public bool HasLotTracking { get; set; }
        public int? MaterialNameId { get; set; }
        public string MaterialNameName { get; set; } = "";
        public string MaterialNameCode { get; set; } = "";
        public int? MaterialTypeId { get; set; }
        public string MaterialTypeName { get; set; } = "";
        public string MaterialTypeCode { get; set; } = "";
        public int? MaterialQualityId { get; set; }
        public string MaterialQualityName { get; set; } = "";
        public string MaterialQualityCode { get; set; } = "";
        
        // Current stock information
    public decimal CurrentStock { get; set; }
        public decimal AvailableStock { get; set; }
        public decimal ReservedStock { get; set; }
        public string StockStatus { get; set; }= ""; // LOW_STOCK, NORMAL, OVERSTOCK
    }