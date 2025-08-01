public class StockItemFilterDto
    {
        public string Search { get; set; }= "";
        public int? CategoryId { get; set; }
        public int? LocationId { get; set; }
        public string StockStatus { get; set; } = "";// LOW_STOCK, NORMAL, OVERSTOCK
        public bool? IsActive { get; set; }
        public bool? IsCritical { get; set; }
        public DateTime? CreatedFrom { get; set; }
        public DateTime? CreatedTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
        public string SortBy { get; set; } = "Name";
        public string SortDirection { get; set; } = "ASC";
        public List<int>? CompanyIds { get; set; }
    }