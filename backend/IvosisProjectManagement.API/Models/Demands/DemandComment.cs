using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IvosisProjectManagement.API.Models.Demand
{
    public class DemandComment
    {
        public int Id { get; set; }
        
        [Required]
        public int DemandId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [StringLength(2000)]
        public string Comment { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string CommentType { get; set; } = "GENERAL"; // GENERAL, APPROVAL, REJECTION, SYSTEM
        
        public bool IsInternal { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        // Navigation Properties
        [ForeignKey("DemandId")]
        public virtual Demand Demand { get; set; } = null!;
        
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}