using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IvosisProjectManagement.API.Models
{
  public class User
  {
    public int Id { get; set; }

    [StringLength(100)]
    public string? Name { get; set; }

    [StringLength(100)]
    public string? Email { get; set; }

    [StringLength(500)]
    public string? Password { get; set; }

    [StringLength(50)]
    public string? Role { get; set; } // Eski rol sistemi için backward compatibility

    // Yeni firma ve departman bilgileri
    public int? CompanyId { get; set; }
    public int? DepartmentId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int? CreatedByUserId { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? UpdatedByUserId { get; set; }

    // Navigation Properties
    [ForeignKey("CompanyId")]
    public virtual Company? Company { get; set; }

    [ForeignKey("DepartmentId")]
    public virtual Department? Department { get; set; }

    [ForeignKey("CreatedByUserId")]
    public virtual User? CreatedByUser { get; set; }

    [ForeignKey("UpdatedByUserId")]
    public virtual User? UpdatedByUser { get; set; }

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<StockItem> CreatedStockItems { get; set; } = new List<StockItem>();
      public virtual ICollection<StockItem> UpdatedStockItems { get; set; } = new List<StockItem>();
      public virtual ICollection<StockLocation> CreatedStockLocations { get; set; } = new List<StockLocation>();
      public virtual ICollection<StockLocation> UpdatedStockLocations { get; set; } = new List<StockLocation>();
      public virtual ICollection<StockCategory> CreatedStockCategories { get; set; } = new List<StockCategory>();
      public virtual ICollection<StockCategory> UpdatedStockCategories { get; set; } = new List<StockCategory>();
      public virtual ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
      public virtual ICollection<StockAlert> CreatedStockAlerts { get; set; } = new List<StockAlert>();
      public virtual ICollection<StockAlert> ReadStockAlerts { get; set; } = new List<StockAlert>();
      public virtual ICollection<Supplier> CreatedSuppliers { get; set; } = new List<Supplier>();
      public virtual ICollection<Supplier> UpdatedSuppliers { get; set; } = new List<Supplier>();
      public virtual ICollection<Unit> CreatedUnits { get; set; } = new List<Unit>();

      // PROJE SİSTEMİ İÇİN NAVİGATİON PROPERTY'LER
      public virtual ICollection<Project> CreatedProjects { get; set; } = new List<Project>();
      public virtual ICollection<Project> UpdatedProjects { get; set; } = new List<Project>();
      public virtual ICollection<ProjectTask> CreatedProjectTasks { get; set; } = new List<ProjectTask>();
      public virtual ICollection<ProjectTask> UpdatedProjectTasks { get; set; } = new List<ProjectTask>();
      public virtual ICollection<ProjectTask> AssignedProjectTasks { get; set; } = new List<ProjectTask>();

      // SÜREÇ VE GÖREV SİSTEMİ İÇİN NAVİGATİON PROPERTY'LER
      public virtual ICollection<Process> CreatedProcesses { get; set; } = new List<Process>();
      public virtual ICollection<Process> UpdatedProcesses { get; set; } = new List<Process>();
      public virtual ICollection<TaskItem> CreatedTasks { get; set; } = new List<TaskItem>();
      public virtual ICollection<TaskItem> UpdatedTasks { get; set; } = new List<TaskItem>();

      // CHAT SİSTEMİ İÇİN NAVİGATİON PROPERTY
      public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

      // AKTİVİTE LOG SİSTEMİ İÇİN NAVİGATİON PROPERTY
      public virtual ICollection<UserActivityLog> ActivityLogs { get; set; } = new List<UserActivityLog>();
  
        
    }

}