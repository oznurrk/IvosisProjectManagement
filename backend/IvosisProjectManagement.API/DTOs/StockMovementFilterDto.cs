public class StockMovementFilterDto
    {
        public string Search { get; set; }= "";
        public int? StockItemId { get; set; }
        public int? LocationId { get; set; }
        public string MovementType { get; set; }= "";
        public string ReferenceType { get; set; }= "";
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
        public string SortBy { get; set; } = "MovementDate";
        public string SortDirection { get; set; } = "DESC";
    }