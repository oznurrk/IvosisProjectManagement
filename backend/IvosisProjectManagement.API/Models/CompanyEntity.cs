using System.ComponentModel.DataAnnotations.Schema;
using IvosisProjectManagement.API.Models;

public abstract class CompanyEntity : CommonBaseEntity
{
    public int? CompanyId { get; set; }

    [ForeignKey("CompanyId")]
    public virtual Company? Company { get; set; }
}