using System.ComponentModel.DataAnnotations.Schema;
using IvosisProjectManagement.API.Models;

public abstract class CompanyEntity : CommonBaseEntity
{
    public int? CompanyId { get; set; }
    
    public virtual Company? Company { get; set; }
}