using System.ComponentModel.DataAnnotations.Schema;

public class StockCategory : CompanyEntity
{
    public string Name { get; set; }
    public string Code { get; set; }
    public string Description { get; set; }
    public int? ParentCategoryId { get; set; }
    public bool IsActive { get; set; } = true;

    [ForeignKey("ParentCategoryId")]
    public virtual StockCategory ParentCategory { get; set; }
    public virtual ICollection<StockCategory> SubCategories { get; set; }
    public virtual ICollection<StockItem> StockItems { get; set; }
}