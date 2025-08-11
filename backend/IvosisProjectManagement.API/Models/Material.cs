// MaterialName Entity
public class MaterialName : CommonBaseEntity
{
    public string Name { get; set; }
    public string Code { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public virtual ICollection<StockItem> StockItems { get; set; }
    public virtual ICollection<MaterialType> MaterialTypes { get; set; }
}

// MaterialType Entity
public class MaterialType : CommonBaseEntity
{
    public int MaterialNameId { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public string Description { get; set; }
    public string TechnicalSpecs { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public virtual MaterialName MaterialName { get; set; }
    public virtual ICollection<StockItem> StockItems { get; set; }
    public virtual ICollection<MaterialQuality> MaterialQualities { get; set; }
}

// MaterialQuality Entity
public class MaterialQuality : CommonBaseEntity
{
    public int MaterialTypeId { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public string Description { get; set; }
    public string QualitySpecs { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public virtual MaterialType MaterialType { get; set; }
    public virtual ICollection<StockItem> StockItems { get; set; }
}