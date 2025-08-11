// MaterialNameDto
using System.ComponentModel.DataAnnotations;

public class MaterialNameDto : BaseDto
{
    public string Name { get; set; } = "";
    public string Code { get; set; } = "";
    public string Description { get; set; } = "";
    public bool IsActive { get; set; }
}

// MaterialTypeDto
public class MaterialTypeDto : BaseDto
{
    public int MaterialNameId { get; set; }
    public string MaterialNameName { get; set; } = "";
    public string Name { get; set; } = "";
    public string Code { get; set; } = "";
    public string Description { get; set; } = "";
    public string TechnicalSpecs { get; set; } = "";
    public bool IsActive { get; set; }
}

// MaterialQualityDto
public class MaterialQualityDto : BaseDto
{
    public int MaterialTypeId { get; set; }
    public string MaterialTypeName { get; set; } = "";
    public string Name { get; set; } = "";
    public string Code { get; set; } = "";
    public string Description { get; set; } = "";
    public string QualitySpecs { get; set; } = "";
    public bool IsActive { get; set; }
}

// Create DTOs
public class MaterialNameDtoCreate
{
    [Required, StringLength(200)]
    public string Name { get; set; } = "";
    
    [Required, StringLength(50)]
    public string Code { get; set; } = "";
    
    [StringLength(1000)]
    public string Description { get; set; } = "";
}

public class MaterialTypeDtoCreate
{
    [Required]
    public int MaterialNameId { get; set; }
    
    [Required, StringLength(200)]
    public string Name { get; set; } = "";
    
    [Required, StringLength(50)]
    public string Code { get; set; } = "";
    
    [StringLength(1000)]
    public string Description { get; set; } = "";
    
    [StringLength(2000)]
    public string TechnicalSpecs { get; set; } = "";
}

public class MaterialQualityDtoCreate
{
    [Required]
    public int MaterialTypeId { get; set; }
    
    [Required, StringLength(200)]
    public string Name { get; set; } = "";
    
    [Required, StringLength(50)]
    public string Code { get; set; } = "";
    
    [StringLength(1000)]
    public string Description { get; set; } = "";
    
    [StringLength(2000)]
    public string QualitySpecs { get; set; } = "";
}