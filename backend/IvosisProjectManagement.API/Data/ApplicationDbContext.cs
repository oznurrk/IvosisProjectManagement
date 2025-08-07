using Microsoft.EntityFrameworkCore;
using IvosisProjectManagement.API.Models;
using System.Text.Json;

namespace IvosisProjectManagement.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Process> Processes { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectTask> ProjectTasks { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<District> Districts { get; set; }
        public DbSet<Neighborhood> Neighborhoods { get; set; }
        public DbSet<ProjectType> ProjectTypes { get; set; }
        public DbSet<PanelBrand> PanelBrands { get; set; }
        public DbSet<InverterBrand> InverterBrands { get; set; }
        public DbSet<ProjectAddress> ProjectAddresses { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<UserActivityLog> UserActivityLogs { get; set; }
        public DbSet<Personnel> Personnel { get; set; }
        public DbSet<StockCategory> StockCategories { get; set; }
        public DbSet<StockLocation> StockLocations { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Unit> Units { get; set; }
        public DbSet<StockItem> StockItems { get; set; }
        public DbSet<StockMovement> StockMovements { get; set; }
        public DbSet<StockBalance> StockBalances { get; set; }
        public DbSet<StockAlert> StockAlerts { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<SupplierCompany> SupplierCompanies { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                // BaseEntity ilişkileri
                if (typeof(CommonBaseEntity).IsAssignableFrom(entityType.ClrType)&& 
                    entityType.ClrType != typeof(Unit))
                {
                    modelBuilder.Entity(entityType.ClrType)
                        .HasOne(typeof(User), "CreatedByUser")
                        .WithMany()
                        .HasForeignKey("CreatedBy")
                        .OnDelete(DeleteBehavior.Restrict);

                    modelBuilder.Entity(entityType.ClrType)
                        .HasOne(typeof(User), "UpdatedByUser")
                        .WithMany()
                        .HasForeignKey("UpdatedBy")
                        .OnDelete(DeleteBehavior.Restrict);
                }
                if (typeof(CompanyEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType)
                        .HasOne(typeof(Company), "Company")
                        .WithMany()
                        .HasForeignKey("CompanyId")
                        .OnDelete(DeleteBehavior.Restrict);
                }
            }

            // Project - Address ilişkileri
            modelBuilder.Entity<Project>()
                .HasMany(p => p.Address)
                .WithOne(a => a.Project)
                .HasForeignKey(a => a.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectAddress>()
                .HasOne(p => p.Project)
                .WithMany(p => p.Address)
                .HasForeignKey(p => p.ProjectId);

            modelBuilder.Entity<ProjectAddress>()
                .HasOne(p => p.City)
                .WithMany()
                .HasForeignKey(p => p.CityId);

            modelBuilder.Entity<ProjectAddress>()
                .HasOne(p => p.District)
                .WithMany()
                .HasForeignKey(p => p.DistrictId);

            modelBuilder.Entity<ProjectAddress>()
                .HasOne(p => p.Neighborhood)
                .WithMany()
                .HasForeignKey(p => p.NeighborhoodId)
                .OnDelete(DeleteBehavior.SetNull);

            // User Configuration
           modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Password).HasMaxLength(500);
                entity.Property(e => e.Role).HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.HasIndex(e => e.Email).IsUnique();

                // Company relationship
                entity.HasOne(u => u.Company)
                    .WithMany(c => c.Users)
                    .HasForeignKey(u => u.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Department relationship
                entity.HasOne(u => u.Department)
                    .WithMany(d => d.Users)
                    .HasForeignKey(u => u.DepartmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Self-referencing relationships
                entity.HasOne(u => u.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(u => u.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(u => u.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(u => u.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Personnel Configuration
            modelBuilder.Entity<Personnel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SicilNo).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Surname).IsRequired().HasMaxLength(100);
                entity.Property(e => e.TCKimlikNo).HasMaxLength(11);
                entity.Property(e => e.Email).HasMaxLength(150);
                entity.Property(e => e.IBAN).HasMaxLength(26);
                entity.Property(e => e.WorkStatus).HasMaxLength(20).HasDefaultValue("Aktif");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.Salary).HasPrecision(18, 2);

                entity.HasIndex(e => e.SicilNo).IsUnique();
                entity.HasIndex(e => e.TCKimlikNo).IsUnique().HasDatabaseName("IX_Personnel_TCKimlikNo").HasFilter("[TCKimlikNo] IS NOT NULL");
                entity.HasIndex(e => e.Email).IsUnique().HasDatabaseName("IX_Personnel_Email").HasFilter("[Email] IS NOT NULL");
                entity.HasIndex(e => e.WorkStatus).HasDatabaseName("IX_Personnel_WorkStatus");
                entity.HasIndex(e => e.Department).HasDatabaseName("IX_Personnel_Department");
                entity.HasIndex(e => new { e.Name, e.Surname }).HasDatabaseName("IX_Personnel_Name");

                entity.HasOne(p => p.Company)
                    .WithMany(c => c.Personnel)
                    .HasForeignKey(p => p.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Company Configuration
            modelBuilder.Entity<Company>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(10);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            });

            // Department Configuration
            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                entity.HasOne(d => d.Company)
                    .WithMany(c => c.Departments)
                    .HasForeignKey(d => d.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.Code, e.CompanyId }).IsUnique();
            });

            // Role Configuration
            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Scope).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.HasIndex(e => e.Code).IsUnique();

                entity.HasCheckConstraint("CK_Roles_Scope",
                    "[Scope] IN ('GROUP', 'COMPANY', 'DEPARTMENT')");
            });

            // UserRole Configuration
            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                entity.HasOne(ur => ur.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(ur => ur.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ur => ur.Company)
                    .WithMany()
                    .HasForeignKey(ur => ur.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ur => ur.Department)
                    .WithMany(d => d.UserRoles)
                    .HasForeignKey(ur => ur.DepartmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.UserId, e.RoleId, e.CompanyId, e.DepartmentId }).IsUnique();
            });

            // Project Configuration
            modelBuilder.Entity<Project>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.Priority).HasMaxLength(50);
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                
                // Decimal precision ayarları
                entity.Property(e => e.AcValue).HasPrecision(18, 2);
                entity.Property(e => e.AdditionalPanelPower).HasPrecision(18, 2);
                entity.Property(e => e.DcValue).HasPrecision(18, 2);
                entity.Property(e => e.InverterPower).HasPrecision(18, 2);
                entity.Property(e => e.PanelPower).HasPrecision(18, 2);

                entity.HasOne(p => p.Company)
                    .WithMany(c => c.Projects)
                    .HasForeignKey(p => p.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.PanelBrand)
                    .WithMany()
                    .HasForeignKey(p => p.PanelBrandId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.InverterBrand)
                    .WithMany()
                    .HasForeignKey(p => p.InverterBrandId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.ProjectType)
                    .WithMany(pt => pt.Projects)
                    .HasForeignKey(p => p.ProjectTypeId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.CreatedByUser)
                    .WithMany(u => u.CreatedProjects)
                    .HasForeignKey(p => p.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.UpdatedByUser)
                    .WithMany(u => u.UpdatedProjects)
                    .HasForeignKey(p => p.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ProjectTask Configuration
            modelBuilder.Entity<ProjectTask>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                // FilePath JSON conversion
               entity.Property(e => e.FilePath)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => string.IsNullOrWhiteSpace(v)
                        ? new List<string>()
                        : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null));

                entity.HasOne(pt => pt.Project)
                    .WithMany(p => p.ProjectTasks)
                    .HasForeignKey(pt => pt.ProjectId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(pt => pt.Task)
                    .WithMany()
                    .HasForeignKey(pt => pt.TaskId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(pt => pt.Process)
                    .WithMany()
                    .HasForeignKey(pt => pt.ProcessId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(pt => pt.AssignedUser)
                    .WithMany(u => u.AssignedProjectTasks)
                    .HasForeignKey(pt => pt.AssignedUserId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(pt => pt.CreatedByUser)
                    .WithMany(u => u.CreatedProjectTasks)
                    .HasForeignKey(pt => pt.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(pt => pt.UpdatedByUser)
                    .WithMany(u => u.UpdatedProjectTasks)
                    .HasForeignKey(pt => pt.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.ProjectId);
                entity.HasIndex(e => e.AssignedUserId);
                entity.HasIndex(e => e.CreatedBy);
            });

            // Process Configuration
            modelBuilder.Entity<Process>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                entity.HasOne(p => p.ParentProcess)
                    .WithMany()
                    .HasForeignKey(p => p.ParentProcessId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.CreatedByUser)
                    .WithMany(u => u.CreatedProcesses)
                    .HasForeignKey(p => p.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.UpdatedByUser)
                    .WithMany(u => u.UpdatedProcesses)
                    .HasForeignKey(p => p.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Company)
                    .WithMany()
                    .HasForeignKey(p => p.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // TaskItem Configuration
            modelBuilder.Entity<TaskItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.Process)
                    .WithMany()
                    .HasForeignKey(e => e.ProcessId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.CreatedByUser)
                    .WithMany(u => u.CreatedTasks)
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.UpdatedByUser)
                    .WithMany(u => u.UpdatedTasks)
                    .HasForeignKey(e => e.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Company)
                    .WithMany()
                    .HasForeignKey(e => e.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // StockCategory Configuration
            modelBuilder.Entity<StockCategory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                entity.HasOne(e => e.ParentCategory)
                    .WithMany(e => e.SubCategories)
                    .HasForeignKey(e => e.ParentCategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.CreatedByUser)
                    .WithMany()
                    .HasForeignKey("CreatedBy")
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey("UpdatedBy")
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // StockLocation Configuration
            modelBuilder.Entity<StockLocation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                entity.HasOne(e => e.CreatedByUser)
                    .WithMany(u => u.CreatedStockLocations)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Supplier Configuration
            modelBuilder.Entity<Supplier>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.TaxNumber).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                entity.HasOne(e => e.CreatedByUser)
                    .WithMany()
                    .HasForeignKey("CreatedBy")
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.UpdatedByUser)
                .WithMany()
                .HasForeignKey("UpdatedBy")
                .OnDelete(DeleteBehavior.Restrict);
            });

            // Unit Configuration
            modelBuilder.Entity<Unit>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                entity.HasOne(e => e.CreatedByUser)
                    .WithMany(u => u.CreatedUnits)
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // StockItem Configuration
            modelBuilder.Entity<StockItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ItemCode).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.Currency).HasDefaultValue("TRY");

                entity.HasOne(e => e.Category)
                    .WithMany(e => e.StockItems)
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Unit)
                    .WithMany(e => e.StockItems)
                    .HasForeignKey(e => e.UnitId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.CreatedByUser)
                    .WithMany(e => e.CreatedStockItems)
                    .HasForeignKey("CreatedBy")
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // StockMovement Configuration
            modelBuilder.Entity<StockMovement>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.MovementDate).HasDefaultValueSql("GETDATE()");

                entity.HasCheckConstraint("CK_StockMovements_MovementType",
                    "MovementType IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT')");

                entity.HasOne(e => e.StockItem)
                    .WithMany(e => e.StockMovements)
                    .HasForeignKey(e => e.StockItemId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Location)
                    .WithMany(e => e.StockMovements)
                    .HasForeignKey(e => e.LocationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.CreatedByUser)
                    .WithMany(e => e.StockMovements)
                    .HasForeignKey("CreatedBy")
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.StockItemId, e.MovementDate });
                entity.HasIndex(e => e.LocationId);
                entity.HasIndex(e => e.MovementType);
            });

            // StockBalance Configuration
            modelBuilder.Entity<StockBalance>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.StockItemId)
                    .IsRequired();
                    
                entity.Property(e => e.LocationId)
                    .IsRequired();
                    
                entity.Property(e => e.CurrentQuantity)
                    .HasColumnType("decimal(18,2)")
                    .HasDefaultValue(0);
                    
                entity.Property(e => e.ReservedQuantity)
                    .HasColumnType("decimal(18,2)")
                    .HasDefaultValue(0);
                    
                // AvailableQuantity'yi veritabanı kolonu olarak tanımla
                entity.Property(e => e.AvailableQuantity)
                    .HasComputedColumnSql("[CurrentQuantity] - [ReservedQuantity]")
                    .HasColumnType("decimal(18,2)");
                            
                entity.Property(e => e.LastUpdateDate)
                    .HasDefaultValueSql("GETDATE()");
                    
                // Foreign Key relationships
                entity.HasOne(e => e.StockItem)
                    .WithMany(s => s.StockBalances)
                    .HasForeignKey(e => e.StockItemId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.Location)
                    .WithMany(l => l.StockBalances)
                    .HasForeignKey(e => e.LocationId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                // Index'ler
                entity.HasIndex(e => new { e.StockItemId, e.LocationId })
                    .IsUnique()
                    .HasDatabaseName("IX_StockBalance_StockItem_Location");
            });

            // StockAlert Configuration
            modelBuilder.Entity<StockAlert>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsRead).HasDefaultValue(false);
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                entity.HasCheckConstraint("CK_StockAlerts_AlertType",
                    "AlertType IN ('LOW_STOCK', 'OVERSTOCK', 'EXPIRED', 'QUALITY_ISSUE')");
                entity.HasCheckConstraint("CK_StockAlerts_AlertLevel",
                    "AlertLevel IN ('INFO', 'WARNING', 'CRITICAL')");

                entity.HasOne(e => e.StockItem)
                    .WithMany(e => e.StockAlerts)
                    .HasForeignKey(e => e.StockItemId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Location)
                    .WithMany()
                    .HasForeignKey(e => e.LocationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ReadByUser)
                    .WithMany()
                    .HasForeignKey("ReadBy")
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => new { e.AlertType, e.AlertLevel });
            });

            // SupplierCompany Configuration
            modelBuilder.Entity<SupplierCompany>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                entity.HasOne(sc => sc.Supplier)
                    .WithMany(s => s.SupplierCompanies)
                    .HasForeignKey(sc => sc.SupplierId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(sc => sc.Company)
                    .WithMany()
                    .HasForeignKey(sc => sc.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.SupplierId, e.CompanyId }).IsUnique();
            });
        }

    }
}
