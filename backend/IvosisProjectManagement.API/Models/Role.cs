using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace IvosisProjectManagement.API.Models
{
    public class Role
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string Scope { get; set; } = string.Empty; // GROUP, COMPANY, DEPARTMENT
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        public string? Permissions { get; set; } // JSON formatında izinler
        
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public int CreatedBy { get; set; }
        
        // Navigation Properties
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }

    public class UserRole
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int RoleId { get; set; }
        
        public int? CompanyId { get; set; } // Belirli bir firmaya özel rol ise
        public int? DepartmentId { get; set; } // Belirli bir departmana özel rol ise
        
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public int CreatedBy { get; set; }
        
        // Navigation Properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
        
        [ForeignKey("RoleId")]
        public virtual Role Role { get; set; } = null!;
        
        [ForeignKey("CompanyId")]
        public virtual Company? Company { get; set; }
        
        [ForeignKey("DepartmentId")]
        public virtual Department? Department { get; set; }
    }
}