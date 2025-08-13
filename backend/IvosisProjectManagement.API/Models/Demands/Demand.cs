using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IvosisProjectManagement.API.Models.Demand
{
    public class Demand : CompanyEntity
    {
        [Required]
        [StringLength(50)]
        public string DemandNumber { get; set; } = string.Empty;
        
        // Proje Bilgileri
        [Required]
        public int ProjectId { get; set; }
        
        // Talep Detayları
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(2000)]
        public string? Description { get; set; }
        
        // Durum ve Öncelik
        [Required]
        public int StatusId { get; set; }
        
        [Required]
        public int PriorityId { get; set; }
        
        // Tarih Bilgileri
        public DateTime RequestedDate { get; set; } = DateTime.Now;
        public DateTime RequiredDate { get; set; }
        public DateTime? ApprovedDate { get; set; }
        
        // Onay Bilgileri
        public bool IsApproved { get; set; } = false;
        public int? ApprovedBy { get; set; }
        
        [StringLength(1000)]
        public string? ApprovalNotes { get; set; }
        
        // Maliyet Bilgileri
        [Column(TypeName = "decimal(18,4)")]
        public decimal? EstimatedBudget { get; set; }
        
        [StringLength(3)]
        public string Currency { get; set; } = "TRY";
        
        // Ek Bilgiler
        [StringLength(2000)]
        public string? Notes { get; set; }
        
        public string? Attachments { get; set; } // JSON format
        
        // Navigation Properties
        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; } = null!;
        
        [ForeignKey("StatusId")]
        public virtual DemandStatus Status { get; set; } = null!;
        
        [ForeignKey("PriorityId")]
        public virtual DemandPriority Priority { get; set; } = null!;
        
        [ForeignKey("ApprovedBy")]
        public virtual User? ApprovedByUser { get; set; }
        
        public virtual ICollection<DemandItem> DemandItems { get; set; } = new List<DemandItem>();
        public virtual ICollection<DemandApproval> DemandApprovals { get; set; } = new List<DemandApproval>();
        public virtual ICollection<DemandComment> DemandComments { get; set; } = new List<DemandComment>();
    }
}