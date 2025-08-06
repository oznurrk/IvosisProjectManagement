using System.ComponentModel.DataAnnotations.Schema;
using IvosisProjectManagement.API.Models;

public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? UpdatedBy { get; set; }
    public int? CompanyId { get; set; }

    // Navigation properties
    [ForeignKey("CreatedBy")]
    public virtual User CreatedByUser { get; set; }

    [ForeignKey("UpdatedBy")]
    public virtual User UpdatedByUser { get; set; }

    [ForeignKey("CompanyId")]
    public virtual Company? Company { get; set; }
    }