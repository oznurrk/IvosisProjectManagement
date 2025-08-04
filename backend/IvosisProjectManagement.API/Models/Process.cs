using System.ComponentModel.DataAnnotations.Schema;

namespace IvosisProjectManagement.API.Models
{
    public class Process
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? ParentProcessId { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CreatedByUserId { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedByUserId { get; set; }
        public int? CompanyId { get; set; }
        
        // Navigation Properties - ForeignKey attribute'ları KALDıRıLDı
        public virtual Process? ParentProcess { get; set; }
        public virtual User? CreatedByUser { get; set; }
        public virtual User? UpdatedByUser { get; set; }
        public virtual Company? Company { get; set; }
    }
}
