namespace IvosisProjectManagement.API.Models
{
  public class User : CompanyEntity
  {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? Role { get; set; }
        public int? DepartmentId { get; set; }
        public virtual Department? Department { get; set; }
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
        public virtual ICollection<Project> CreatedProjects { get; set; } = new List<Project>();
        public virtual ICollection<Project> UpdatedProjects { get; set; } = new List<Project>();
        public virtual ICollection<ProjectTask> CreatedProjectTasks { get; set; } = new List<ProjectTask>();
        public virtual ICollection<ProjectTask> UpdatedProjectTasks { get; set; } = new List<ProjectTask>();
        public virtual ICollection<ProjectTask> AssignedProjectTasks { get; set; } = new List<ProjectTask>();
        public virtual ICollection<Process> CreatedProcesses { get; set; } = new List<Process>();
        public virtual ICollection<Process> UpdatedProcesses { get; set; } = new List<Process>();
        public virtual ICollection<TaskItem> CreatedTasks { get; set; } = new List<TaskItem>();
        public virtual ICollection<TaskItem> UpdatedTasks { get; set; } = new List<TaskItem>();
        public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();
        public virtual ICollection<UserActivityLog> ActivityLogs { get; set; } = new List<UserActivityLog>();
  
        
    }

}