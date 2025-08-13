using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IvosisProjectManagement.API.Models.Demand
{
    public class DemandApproval : BaseEntity
    {
        [Required]
        public int DemandId { get; set; }
        
        // Onay Bilgileri
        public int ApprovalLevel { get; set; } // 1: Departman Müdürü, 2: Genel Müdür, vs.
        
        [Required]
        public int ApproverUserId { get; set; }
        
        [StringLength(20)]
        public string ApprovalStatus { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED
        
        public DateTime? ApprovalDate { get; set; }
        
        [StringLength(1000)]
        public string? ApprovalNotes { get; set; }
        
        // Sıralama
        public int SortOrder { get; set; }
        public bool IsRequired { get; set; } = true;
        public bool IsCompleted { get; set; } = false;
        
        // Navigation Properties
        [ForeignKey("DemandId")]
        public virtual Demand Demand { get; set; } = null!;
        
        [ForeignKey("ApproverUserId")]
        public virtual User ApproverUser { get; set; } = null!;
    }
}