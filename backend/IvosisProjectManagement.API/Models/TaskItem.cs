using System.ComponentModel.DataAnnotations.Schema;

namespace IvosisProjectManagement.API.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        public int ProcessId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int CreatedByUserId { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedByUserId { get; set; }
        public int? CompanyId { get; set; }

        // Navigation Properties - BUNLAR DA EKSİK OLABİLİR
        [ForeignKey("ProcessId")]
        public virtual Process? Process { get; set; }
        
        [ForeignKey("CreatedByUserId")]
        public virtual User? CreatedByUser { get; set; }
        
        [ForeignKey("UpdatedByUserId")]
        public virtual User? UpdatedByUser { get; set; }
        
        [ForeignKey("CompanyId")]
        public virtual Company? Company { get; set; }
    }
}