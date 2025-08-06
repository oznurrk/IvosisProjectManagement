using System.ComponentModel.DataAnnotations;

namespace IvosisProjectManagement.API.Models
{
    public class Company : BaseEntity
    {
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(10)]
        public string Code { get; set; } = string.Empty; // STEEL, ENERGY
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        // Navigation Properties
        public virtual ICollection<User> Users { get; set; } = new List<User>();
        public virtual ICollection<Department> Departments { get; set; } = new List<Department>();
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
        public virtual ICollection<Personnel> Personnel { get; set; } = new List<Personnel>();
        public virtual ICollection<StockItem> StockItems { get; set; } = new List<StockItem>();
    }
    
    public class Department :CompanyEntity
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string Code { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public virtual ICollection<User> Users { get; set; } = new List<User>();
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}