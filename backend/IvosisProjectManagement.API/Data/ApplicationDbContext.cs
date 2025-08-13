using Microsoft.EntityFrameworkCore;
using IvosisProjectManagement.API.Models;
using System.Text.Json;
using IvosisProjectManagement.API.Models.Demand;

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
        public DbSet<StockLot> StockLots { get; set; }
        public DbSet<MaterialName> MaterialNames { get; set; }
        public DbSet<MaterialType> MaterialTypes { get; set; }
        public DbSet<MaterialQuality> MaterialQualities { get; set; }
        
        //Demand Module
        public DbSet<DemandStatus> DemandStatuses { get; set; }
        public DbSet<DemandPriority> DemandPriorities { get; set; }
        public DbSet<Demand> Demands { get; set; }
        public DbSet<DemandItem> DemandItems { get; set; }
        public DbSet<DemandApproval> DemandApprovals { get; set; }
        public DbSet<DemandComment> DemandComments { get; set; }

        // Quotation Module
        //public DbSet<QuotationType> QuotationTypes { get; set; }
        //public DbSet<QuotationStatus> QuotationStatuses { get; set; }
        //public DbSet<Quotation> Quotations { get; set; }
        //public DbSet<QuotationItem> QuotationItems { get; set; }
        //public DbSet<QuotationComparison> QuotationComparisons { get; set; }
        //public DbSet<QuotationComparisonItem> QuotationComparisonItems { get; set; }
        //public DbSet<QuotationComment> QuotationComments { get; set; }

        // Order Module
        //public DbSet<OrderType> OrderTypes { get; set; }
        //public DbSet<OrderStatus> OrderStatuses { get; set; }
        //public DbSet<Order> Orders { get; set; }
        //public DbSet<OrderItem> OrderItems { get; set; }
        //public DbSet<OrderDelivery> OrderDeliveries { get; set; }
        //public DbSet<OrderDeliveryItem> OrderDeliveryItems { get; set; }
        //public DbSet<OrderPayment> OrderPayments { get; set; }
        //public DbSet<OrderApproval> OrderApprovals { get; set; }
        //public DbSet<OrderComment> OrderComments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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

            // ✅ User Configuration - EXPLICIT TÜM İLİŞKİLER
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Password).HasMaxLength(500);
                entity.Property(e => e.Role).HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.HasIndex(e => e.Email).IsUnique();

                // Department relationship
                entity.HasOne(u => u.Department)
                    .WithMany(d => d.Users)
                    .HasForeignKey(u => u.DepartmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Company relationship
                entity.HasOne(u => u.Company)
                    .WithMany(c => c.Users)
                    .HasForeignKey(u => u.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Self-referencing relationships - EXPLICIT
                entity.HasOne(u => u.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(u => u.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(u => u.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(u => u.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ✅ Personnel Configuration - EXPLICIT İLİŞKİLER
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

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(p => p.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(p => p.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(p => p.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Company)
                    .WithMany(c => c.Personnel)
                    .HasForeignKey(p => p.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ✅ Company Configuration - EXPLICIT İLİŞKİLER
            modelBuilder.Entity<Company>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(10);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(c => c.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(c => c.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(c => c.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ✅ Department Configuration - EXPLICIT İLİŞKİLER
            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                entity.HasIndex(e => new { e.Code, e.CompanyId }).IsUnique();

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(d => d.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(d => d.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(d => d.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Company)
                    .WithMany(c => c.Departments)
                    .HasForeignKey(d => d.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ✅ Role Configuration - EXPLICIT İLİŞKİLER
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

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(r => r.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(r => r.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(r => r.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ✅ UserRole Configuration - EXPLICIT İLİŞKİLER
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

                entity.HasOne(ur => ur.Department)
                    .WithMany(d => d.UserRoles)
                    .HasForeignKey(ur => ur.DepartmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(ur => ur.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(ur => ur.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ur => ur.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(ur => ur.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ur => ur.Company)
                    .WithMany()
                    .HasForeignKey(ur => ur.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.UserId, e.RoleId, e.CompanyId, e.DepartmentId }).IsUnique();
            });

            // ✅ Project Configuration - EXPLICIT İLİŞKİLER
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

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(p => p.CreatedByUser)
                    .WithMany(u => u.CreatedProjects)
                    .HasForeignKey(p => p.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.UpdatedByUser)
                    .WithMany(u => u.UpdatedProjects)
                    .HasForeignKey(p => p.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

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
            });

            // ✅ ProjectTask Configuration - EXPLICIT İLİŞKİLER
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

                // EXPLICIT Foreign Key Configuration
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

            // ✅ Process Configuration - EXPLICIT İLİŞKİLER
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

                // EXPLICIT Foreign Key Configuration
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

            // ✅ TaskItem Configuration - EXPLICIT İLİŞKİLER
            modelBuilder.Entity<TaskItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.Process)
                    .WithMany()
                    .HasForeignKey(e => e.ProcessId)
                    .OnDelete(DeleteBehavior.Restrict);

                // EXPLICIT Foreign Key Configuration
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

            // ✅ StockCategory Configuration - EXPLICIT İLİŞKİLER
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

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(sc => sc.CreatedByUser)
                    .WithMany(u => u.CreatedStockCategories)
                    .HasForeignKey(sc => sc.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sc => sc.UpdatedByUser)
                    .WithMany(u => u.UpdatedStockCategories)
                    .HasForeignKey(sc => sc.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sc => sc.Company)
                    .WithMany()
                    .HasForeignKey(sc => sc.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ✅ StockLocation Configuration - EXPLICIT İLİŞKİLER
            modelBuilder.Entity<StockLocation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.Capacity).HasPrecision(18, 2);

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(sl => sl.CreatedByUser)
                    .WithMany(u => u.CreatedStockLocations)
                    .HasForeignKey(sl => sl.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sl => sl.UpdatedByUser)
                    .WithMany(u => u.UpdatedStockLocations)
                    .HasForeignKey(sl => sl.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sl => sl.Company)
                    .WithMany()
                    .HasForeignKey(sl => sl.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ✅ Supplier Configuration - EXPLICIT İLİŞKİLER
            modelBuilder.Entity<Supplier>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.TaxNumber).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(s => s.CreatedByUser)
                    .WithMany(u => u.CreatedSuppliers)
                    .HasForeignKey(s => s.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.UpdatedByUser)
                    .WithMany(u => u.UpdatedSuppliers)
                    .HasForeignKey(s => s.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Company)
                    .WithMany()
                    .HasForeignKey(s => s.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ✅ Unit Configuration - EXPLICIT İLİŞKİLER
            modelBuilder.Entity<Unit>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(u => u.CreatedByUser)
                    .WithMany(user => user.CreatedUnits)
                    .HasForeignKey(u => u.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(u => u.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(u => u.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ✅ StockItem Configuration - EXPLICIT İLİŞKİLER
            modelBuilder.Entity<StockItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ItemCode).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.Currency).HasDefaultValue("TRY");

                entity.Property(e => e.MinimumStock).HasPrecision(18, 2);
                entity.Property(e => e.MaximumStock).HasPrecision(18, 2);
                entity.Property(e => e.ReorderLevel).HasPrecision(18, 2);
                entity.Property(e => e.PurchasePrice).HasPrecision(18, 2);
                entity.Property(e => e.SalePrice).HasPrecision(18, 2);

                // EXPLICIT Foreign Key Configurations
                entity.HasOne(si => si.CreatedByUser)
                    .WithMany(u => u.CreatedStockItems)
                    .HasForeignKey(si => si.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(si => si.UpdatedByUser)
                    .WithMany(u => u.UpdatedStockItems)
                    .HasForeignKey(si => si.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(si => si.Company)
                    .WithMany(c => c.StockItems)
                    .HasForeignKey(si => si.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Category)
                    .WithMany(e => e.StockItems)
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Unit)
                    .WithMany(e => e.StockItems)
                    .HasForeignKey(e => e.UnitId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.MaterialName)
             .WithMany(e => e.StockItems)
             .HasForeignKey(e => e.MaterialNameId)
             .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.MaterialType)
                    .WithMany(e => e.StockItems)
                    .HasForeignKey(e => e.MaterialTypeId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.MaterialQuality)
                  .WithMany(e => e.StockItems)
                  .HasForeignKey(e => e.MaterialQualityId)
                  .OnDelete(DeleteBehavior.SetNull);
            });

            // ✅ StockMovement Configuration - EXPLICIT İLİŞKİLER
            modelBuilder.Entity<StockMovement>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.MovementDate).HasDefaultValueSql("GETDATE()");

                entity.Property(e => e.Quantity).HasPrecision(18, 2);
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);

                entity.HasCheckConstraint("CK_StockMovements_MovementType",
                    "MovementType IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT')");

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(sm => sm.CreatedByUser)
                    .WithMany(u => u.StockMovements)
                    .HasForeignKey(sm => sm.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sm => sm.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(sm => sm.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sm => sm.Company)
                    .WithMany()
                    .HasForeignKey(sm => sm.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.StockItem)
                    .WithMany(e => e.StockMovements)
                    .HasForeignKey(e => e.StockItemId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Location)
                    .WithMany(e => e.StockMovements)
                    .HasForeignKey(e => e.LocationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.StockLot)
                  .WithMany(s => s.StockMovements)
                  .HasForeignKey(e => e.StockLotId)
                  .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.StockItemId, e.MovementDate });
                entity.HasIndex(e => e.LocationId);
                entity.HasIndex(e => e.MovementType);
                entity.HasIndex(e => e.StockLotId);
                entity.HasIndex(e => e.ReferenceType);

                // Check constraint for MovementType
                entity.HasCheckConstraint("CK_StockMovements_MovementType",
                    "MovementType IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT')");
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

                entity.Property(e => e.AvailableQuantity)
                    .HasComputedColumnSql("[CurrentQuantity] - [ReservedQuantity]")
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.LastUpdateDate)
                    .HasDefaultValueSql("GETDATE()");

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(sb => sb.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(sb => sb.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sb => sb.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(sb => sb.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sb => sb.Company)
                    .WithMany()
                    .HasForeignKey(sb => sb.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.StockItem)
                    .WithMany(s => s.StockBalances)
                    .HasForeignKey(e => e.StockItemId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Location)
                    .WithMany(l => l.StockBalances)
                    .HasForeignKey(e => e.LocationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.StockItemId, e.LocationId })
                    .IsUnique()
                    .HasDatabaseName("IX_StockBalance_StockItem_Location");
            });

            // ✅ StockAlert Configuration - EXPLICIT İLİŞKİLER (İKİ AYRI USER İLİŞKİSİ)
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

                // EXPLICIT Foreign Key Configuration - İKİ AYRI USER İLİŞKİSİ
                entity.HasOne(sa => sa.CreatedByUser)
                    .WithMany(u => u.CreatedStockAlerts)
                    .HasForeignKey(sa => sa.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sa => sa.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(sa => sa.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sa => sa.ReadByUser)
                    .WithMany(u => u.ReadStockAlerts)
                    .HasForeignKey(sa => sa.ReadBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sa => sa.Company)
                    .WithMany()
                    .HasForeignKey(sa => sa.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.StockItem)
                    .WithMany(e => e.StockAlerts)
                    .HasForeignKey(e => e.StockItemId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Location)
                    .WithMany()
                    .HasForeignKey(e => e.LocationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => new { e.AlertType, e.AlertLevel });
            });

            // ✅ SupplierCompany Configuration - EXPLICIT İLİŞKİLER
            modelBuilder.Entity<SupplierCompany>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(sc => sc.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(sc => sc.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sc => sc.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(sc => sc.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sc => sc.Company)
                    .WithMany()
                    .HasForeignKey(sc => sc.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sc => sc.Supplier)
                    .WithMany(s => s.SupplierCompanies)
                    .HasForeignKey(sc => sc.SupplierId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.SupplierId, e.CompanyId }).IsUnique();
            });

            // UserActivityLog Configuration
            modelBuilder.Entity<UserActivityLog>()
                .HasOne(u => u.User)
                .WithMany(u => u.ActivityLogs)
                .HasForeignKey(u => u.UserId);

            // StockLot configuration
            modelBuilder.Entity<StockLot>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.LotNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.InternalLotNumber).HasMaxLength(50);
                entity.Property(e => e.LabelNumber).HasMaxLength(50);
                entity.Property(e => e.Barcode).HasMaxLength(100);
                entity.Property(e => e.CertificateNumber).HasMaxLength(100);
                entity.Property(e => e.QualityGrade).HasMaxLength(50);
                entity.Property(e => e.TestResults).HasMaxLength(500);
                entity.Property(e => e.StoragePosition).HasMaxLength(100);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
                entity.Property(e => e.BlockReason).HasMaxLength(250);

                // Decimal precision
                entity.Property(e => e.InitialWeight).HasColumnType("decimal(18,4)");
                entity.Property(e => e.CurrentWeight).HasColumnType("decimal(18,4)");
                entity.Property(e => e.InitialLength).HasColumnType("decimal(18,4)");
                entity.Property(e => e.CurrentLength).HasColumnType("decimal(18,4)");
                entity.Property(e => e.Width).HasColumnType("decimal(18,4)");
                entity.Property(e => e.Thickness).HasColumnType("decimal(18,4)");

                // Indexes
                entity.HasIndex(e => e.LotNumber).IsUnique();
                entity.HasIndex(e => e.LabelNumber);
                entity.HasIndex(e => e.StockItemId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.IsBlocked);

                // Relationships
                entity.HasOne(e => e.StockItem)
                    .WithMany()
                    .HasForeignKey(e => e.StockItemId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Supplier)
                    .WithMany()
                    .HasForeignKey(e => e.SupplierId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Location)
                    .WithMany()
                    .HasForeignKey(e => e.LocationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sc => sc.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(sc => sc.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sc => sc.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(sc => sc.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sc => sc.Company)
                    .WithMany()
                    .HasForeignKey(sc => sc.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.SupplierId, e.CompanyId }).IsUnique();
            });
            //Material Configuration
            modelBuilder.Entity<MaterialName>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(m => m.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(m => m.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(m => m.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

            });
            modelBuilder.Entity<MaterialType>(entity =>
            {
                entity.ToTable("MaterialTypes");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.TechnicalSpecs).HasMaxLength(2000);
                entity.HasIndex(e => e.Code).IsUnique();

                entity.HasOne(e => e.MaterialName)
                    .WithMany(e => e.MaterialTypes)
                    .HasForeignKey(e => e.MaterialNameId)
                    .OnDelete(DeleteBehavior.Restrict);

                // EXPLICIT Foreign Key Configuration
                entity.HasOne(mt => mt.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(mt => mt.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(mt => mt.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(mt => mt.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

            });
            modelBuilder.Entity<MaterialQuality>(entity =>
           {
               entity.ToTable("MaterialQualities");
               entity.HasKey(e => e.Id);
               entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
               entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
               entity.Property(e => e.Description).HasMaxLength(1000);
               entity.Property(e => e.QualitySpecs).HasMaxLength(2000);
               entity.HasIndex(e => e.Code).IsUnique();

               entity.HasOne(e => e.MaterialType)
                      .WithMany(e => e.MaterialQualities)
                      .HasForeignKey(e => e.MaterialTypeId)
                      .OnDelete(DeleteBehavior.Restrict);

               entity.HasOne(mq => mq.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(mq => mq.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

               entity.HasOne(mq => mq.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(mq => mq.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
           });

           // Demand Configuration
            modelBuilder.Entity<Demand>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.DemandNumber).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.DemandNumber).IsUnique();
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.Currency).HasDefaultValue("TRY");
                entity.Property(e => e.IsApproved).HasDefaultValue(false);

                // Decimal precision
                entity.Property(e => e.EstimatedBudget).HasColumnType("decimal(18,4)");

                // EXPLICIT Foreign Key Configuration - DİĞER ENTİTY'LER GİBİ
                entity.HasOne(d => d.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(d => d.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(d => d.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Company)
                    .WithMany()
                    .HasForeignKey(d => d.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Project)
                    .WithMany()
                    .HasForeignKey(e => e.ProjectId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Status)
                    .WithMany(s => s.Demands)
                    .HasForeignKey(e => e.StatusId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Priority)
                    .WithMany(p => p.Demands)
                    .HasForeignKey(e => e.PriorityId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ApprovedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.ApprovedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                // Indexes
                entity.HasIndex(e => e.ProjectId);
                entity.HasIndex(e => e.StatusId);
                entity.HasIndex(e => e.PriorityId);
                entity.HasIndex(e => e.RequestedDate);
                entity.HasIndex(e => e.RequiredDate);
            });

            // DemandItem Configuration
            modelBuilder.Entity<DemandItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ItemName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.Currency).HasDefaultValue("TRY");
                entity.Property(e => e.Status).HasDefaultValue("PENDING");

                // Decimal precision
                entity.Property(e => e.RequestedQuantity).HasColumnType("decimal(18,3)");
                entity.Property(e => e.EstimatedUnitPrice).HasColumnType("decimal(18,4)");
                entity.Property(e => e.EstimatedTotalPrice).HasColumnType("decimal(18,4)");

                // EXPLICIT Foreign Key Configuration - DİĞER ENTİTY'LER GİBİ
                entity.HasOne(di => di.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(di => di.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(di => di.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(di => di.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Demand)
                    .WithMany(d => d.DemandItems)
                    .HasForeignKey(e => e.DemandId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.StockItem)
                    .WithMany()
                    .HasForeignKey(e => e.StockItemId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Unit)
                    .WithMany()
                    .HasForeignKey(e => e.UnitId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.SuggestedSupplier)
                    .WithMany()
                    .HasForeignKey(e => e.SuggestedSupplierId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasCheckConstraint("CK_DemandItems_Status",
                    "[Status] IN ('PENDING', 'APPROVED', 'REJECTED', 'ORDERED', 'CANCELLED')");

                // Indexes
                entity.HasIndex(e => e.DemandId);
                entity.HasIndex(e => e.StockItemId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.RequiredDate);
            });

            // DemandApproval Configuration
            modelBuilder.Entity<DemandApproval>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.ApprovalStatus).HasDefaultValue("PENDING");
                entity.Property(e => e.IsRequired).HasDefaultValue(true);
                entity.Property(e => e.IsCompleted).HasDefaultValue(false);

                // EXPLICIT Foreign Key Configuration - DİĞER ENTİTY'LER GİBİ
                entity.HasOne(da => da.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(da => da.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(da => da.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(da => da.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Demand)
                    .WithMany(d => d.DemandApprovals)
                    .HasForeignKey(e => e.DemandId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.ApproverUser)
                    .WithMany()
                    .HasForeignKey(e => e.ApproverUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasCheckConstraint("CK_DemandApprovals_Status",
                    "[ApprovalStatus] IN ('PENDING', 'APPROVED', 'REJECTED')");

                // Indexes
                entity.HasIndex(e => e.DemandId);
                entity.HasIndex(e => e.ApproverUserId);
                entity.HasIndex(e => e.ApprovalStatus);
                entity.HasIndex(e => e.ApprovalLevel);
            });

            // DemandStatus Configuration
            modelBuilder.Entity<DemandStatus>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                // EXPLICIT Foreign Key Configuration - DİĞER ENTİTY'LER GİBİ
                entity.HasOne(ds => ds.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(ds => ds.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

            });
            /*
            // QuotationType Configuration
        modelBuilder.Entity<QuotationType>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey("CreatedBy")
                .OnDelete(DeleteBehavior.Restrict);
        });

        // QuotationStatus Configuration
        modelBuilder.Entity<QuotationStatus>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey("CreatedBy")
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Quotation Configuration
        modelBuilder.Entity<Quotation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.QuotationNumber).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.QuotationNumber).IsUnique();
            entity.Property(e => e.Direction).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.Currency).HasDefaultValue("TRY");
            entity.Property(e => e.TaxRate).HasDefaultValue(18);
            
            // Decimal precision
            entity.Property(e => e.SubTotal).HasColumnType("decimal(18,4)").HasDefaultValue(0);
            entity.Property(e => e.TaxAmount).HasColumnType("decimal(18,4)").HasDefaultValue(0);
            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18,4)").HasDefaultValue(0);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,4)").HasDefaultValue(0);

            entity.HasOne(e => e.Type)
                .WithMany(t => t.Quotations)
                .HasForeignKey(e => e.TypeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Demand)
                .WithMany()
                .HasForeignKey(e => e.DemandId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Supplier)
                .WithMany()
                .HasForeignKey(e => e.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Status)
                .WithMany(s => s.Quotations)
                .HasForeignKey(e => e.StatusId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasCheckConstraint("CK_Quotations_Direction",
                "[Direction] IN ('INCOMING', 'OUTGOING')");

            // Indexes
            entity.HasIndex(e => e.Direction);
            entity.HasIndex(e => e.ProjectId);
            entity.HasIndex(e => e.DemandId);
            entity.HasIndex(e => e.SupplierId);
            entity.HasIndex(e => e.StatusId);
            entity.HasIndex(e => e.QuotationDate);
            entity.HasIndex(e => e.ValidUntil);
        });

        // QuotationItem Configuration
        modelBuilder.Entity<QuotationItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ItemName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.Currency).HasDefaultValue("TRY");
            entity.Property(e => e.Status).HasDefaultValue("ACTIVE");
            entity.Property(e => e.DiscountPercent).HasDefaultValue(0);
            
            // Decimal precision
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,3)");
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,4)");
            entity.Property(e => e.LineTotal).HasColumnType("decimal(18,4)");
            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18,4)").HasDefaultValue(0);
            entity.Property(e => e.NetLineTotal).HasColumnType("decimal(18,4)");

            entity.HasOne(e => e.Quotation)
                .WithMany(q => q.QuotationItems)
                .HasForeignKey(e => e.QuotationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.StockItem)
                .WithMany()
                .HasForeignKey(e => e.StockItemId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Unit)
                .WithMany()
                .HasForeignKey(e => e.UnitId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.DemandItem)
                .WithMany()
                .HasForeignKey(e => e.DemandItemId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasCheckConstraint("CK_QuotationItems_Status",
                "[Status] IN ('ACTIVE', 'CANCELLED', 'ALTERNATIVE')");

            // Indexes
            entity.HasIndex(e => e.QuotationId);
            entity.HasIndex(e => e.StockItemId);
            entity.HasIndex(e => e.DemandItemId);
            entity.HasIndex(e => e.Status);
        });

        // QuotationComparison Configuration
        modelBuilder.Entity<QuotationComparison>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ComparisonName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.Status).HasDefaultValue("ACTIVE");

            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Demand)
                .WithMany()
                .HasForeignKey(e => e.DemandId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.WinnerQuotation)
                .WithMany()
                .HasForeignKey(e => e.WinnerQuotationId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.DecisionByUser)
                .WithMany()
                .HasForeignKey(e => e.DecisionBy)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            entity.HasIndex(e => e.ProjectId);
            entity.HasIndex(e => e.DemandId);
            entity.HasIndex(e => e.Status);
        });

        // QuotationComparisonItem Configuration
        modelBuilder.Entity<QuotationComparisonItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            
            // Decimal precision for scores
            entity.Property(e => e.PriceScore).HasColumnType("decimal(3,1)");
            entity.Property(e => e.QualityScore).HasColumnType("decimal(3,1)");
            entity.Property(e => e.DeliveryScore).HasColumnType("decimal(3,1)");
            entity.Property(e => e.ServiceScore).HasColumnType("decimal(3,1)");
            entity.Property(e => e.TotalScore).HasColumnType("decimal(4,1)");

            entity.HasOne(e => e.Comparison)
                .WithMany(c => c.QuotationComparisonItems)
                .HasForeignKey(e => e.ComparisonId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Quotation)
                .WithMany()
                .HasForeignKey(e => e.QuotationId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.ComparisonId, e.QuotationId }).IsUnique();
        });

        // QuotationComment Configuration
        modelBuilder.Entity<QuotationComment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Comment).IsRequired().HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.CommentType).HasDefaultValue("GENERAL");
            entity.Property(e => e.IsInternal).HasDefaultValue(true);

            entity.HasOne(e => e.Quotation)
                .WithMany(q => q.QuotationComments)
                .HasForeignKey(e => e.QuotationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasCheckConstraint("CK_QuotationComments_Type",
                "[CommentType] IN ('GENERAL', 'EVALUATION', 'NEGOTIATION', 'DECISION', 'TECHNICAL')");

            // Indexes
            entity.HasIndex(e => e.QuotationId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CreatedAt);
        });
            */
        
        /*
        // OrderType Configuration
        modelBuilder.Entity<OrderType>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey("CreatedBy")
                .OnDelete(DeleteBehavior.Restrict);
        });

        // OrderStatus Configuration
        modelBuilder.Entity<OrderStatus>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey("CreatedBy")
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Order Configuration
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OrderNumber).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            entity.Property(e => e.Direction).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.Currency).HasDefaultValue("TRY");
            entity.Property(e => e.TaxRate).HasDefaultValue(18);
            entity.Property(e => e.PaymentStatus).HasDefaultValue("PENDING");
            entity.Property(e => e.IsApproved).HasDefaultValue(false);
            
            // Decimal precision
            entity.Property(e => e.SubTotal).HasColumnType("decimal(18,4)").HasDefaultValue(0);
            entity.Property(e => e.TaxAmount).HasColumnType("decimal(18,4)").HasDefaultValue(0);
            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18,4)").HasDefaultValue(0);
            entity.Property(e => e.ShippingCost).HasColumnType("decimal(18,4)").HasDefaultValue(0);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,4)").HasDefaultValue(0);
            entity.Property(e => e.PaidAmount).HasColumnType("decimal(18,4)").HasDefaultValue(0);

            entity.HasOne(e => e.Type)
                .WithMany(t => t.Orders)
                .HasForeignKey(e => e.TypeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Demand)
                .WithMany()
                .HasForeignKey(e => e.DemandId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Quotation)
                .WithMany()
                .HasForeignKey(e => e.QuotationId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Supplier)
                .WithMany()
                .HasForeignKey(e => e.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Status)
                .WithMany(s => s.Orders)
                .HasForeignKey(e => e.StatusId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ApprovedByUser)
                .WithMany()
                .HasForeignKey(e => e.ApprovedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasCheckConstraint("CK_Orders_Direction",
                "[Direction] IN ('PURCHASE', 'SALES')");
            entity.HasCheckConstraint("CK_Orders_PaymentStatus",
                "[PaymentStatus] IN ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED')");

            // Indexes
            entity.HasIndex(e => e.Direction);
            entity.HasIndex(e => e.ProjectId);
            entity.HasIndex(e => e.DemandId);
            entity.HasIndex(e => e.QuotationId);
            entity.HasIndex(e => e.SupplierId);
            entity.HasIndex(e => e.StatusId);
            entity.HasIndex(e => e.OrderDate);
            entity.HasIndex(e => e.RequiredDate);
            entity.HasIndex(e => e.PaymentStatus);
        });

        // OrderItem Configuration
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ItemName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.Currency).HasDefaultValue("TRY");
            entity.Property(e => e.Status).HasDefaultValue("PENDING");
            entity.Property(e => e.CompletionPercent).HasDefaultValue(0);
            entity.Property(e => e.DiscountPercent).HasDefaultValue(0);
            
            // Decimal precision
            entity.Property(e => e.OrderedQuantity).HasColumnType("decimal(18,3)");
            entity.Property(e => e.DeliveredQuantity).HasColumnType("decimal(18,3)").HasDefaultValue(0);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,4)");
            entity.Property(e => e.LineTotal).HasColumnType("decimal(18,4)");
            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18,4)").HasDefaultValue(0);
            entity.Property(e => e.NetLineTotal).HasColumnType("decimal(18,4)");
            entity.Property(e => e.CompletionPercent).HasColumnType("decimal(5,2)");

            entity.HasOne(e => e.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(e => e.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.QuotationItem)
                .WithMany()
                .HasForeignKey(e => e.QuotationItemId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.DemandItem)
                .WithMany()
                .HasForeignKey(e => e.DemandItemId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.StockItem)
                .WithMany()
                .HasForeignKey(e => e.StockItemId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Unit)
                .WithMany()
                .HasForeignKey(e => e.UnitId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.QualityCheckedByUser)
                .WithMany()
                .HasForeignKey(e => e.QualityCheckedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasCheckConstraint("CK_OrderItems_Status",
                "[Status] IN ('PENDING', 'CONFIRMED', 'PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED')");
            entity.HasCheckConstraint("CK_OrderItems_QualityStatus",
                "[QualityStatus] IS NULL OR [QualityStatus] IN ('PENDING', 'APPROVED', 'REJECTED', 'CONDITIONAL')");

            // Indexes
            entity.HasIndex(e => e.OrderId);
            entity.HasIndex(e => e.StockItemId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.RequiredDate);
            entity.HasIndex(e => e.QualityStatus);
        });
        */

        }
    }
}