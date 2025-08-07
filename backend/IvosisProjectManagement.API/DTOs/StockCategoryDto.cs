 public class StockCategoryDto : CompanyDto
    {
        public string Name { get; set; }= "";
        public string Code { get; set; }= "";
        public string Description { get; set; }= "";
        public int? ParentCategoryId { get; set; }
        public string ParentCategoryName { get; set; }= "";
        public bool IsActive { get; set; }
        public int ItemCount { get; set; }
        public List<StockCategoryDto> SubCategories { get; set; } = new List<StockCategoryDto>();
    }