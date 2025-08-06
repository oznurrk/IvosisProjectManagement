using System.ComponentModel.DataAnnotations.Schema;
using IvosisProjectManagement.API.Models;

public abstract class CommonBaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? UpdatedBy { get; set; }

    // Navigation properties
    [ForeignKey("CreatedBy")]
    public virtual User CreatedByUser { get; set; }
    
    [ForeignKey("UpdatedBy")]
    public virtual User? UpdatedByUser { get; set; }
}