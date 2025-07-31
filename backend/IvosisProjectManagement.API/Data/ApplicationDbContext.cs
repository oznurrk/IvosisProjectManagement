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


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Buraya ilişki tanımlamaları yapılır
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
                .OnDelete(DeleteBehavior.SetNull); // Nullable olduğu için

            modelBuilder.Entity<ProjectTask>()
            .Property(e => e.FilePath)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => string.IsNullOrWhiteSpace(v)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null));

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
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()");

                // Unique constraints - NULL değerleri hariç tut
                entity.HasIndex(e => e.SicilNo).IsUnique();
                entity.HasIndex(e => e.TCKimlikNo).IsUnique().HasDatabaseName("IX_Personnel_TCKimlikNo").HasFilter("[TCKimlikNo] IS NOT NULL");
                entity.HasIndex(e => e.Email).IsUnique().HasDatabaseName("IX_Personnel_Email").HasFilter("[Email] IS NOT NULL");

                // Diğer indexler
                entity.HasIndex(e => e.WorkStatus).HasDatabaseName("IX_Personnel_WorkStatus");
                entity.HasIndex(e => e.Department).HasDatabaseName("IX_Personnel_Department");
                entity.HasIndex(e => new { e.Name, e.Surname }).HasDatabaseName("IX_Personnel_Name");
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            });
            // StockCategory Configuration
            modelBuilder.Entity<StockCategory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                // Self-referencing relationship
                entity.HasOne(e => e.ParentCategory)
                      .WithMany(e => e.SubCategories)
                      .HasForeignKey(e => e.ParentCategoryId)
                      .OnDelete(DeleteBehavior.Restrict);

                // User relationships
                entity.HasOne(e => e.CreatedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.CreatedBy)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.UpdatedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.UpdatedBy)
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
                      .WithMany()
                      .HasForeignKey(e => e.CreatedBy)
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
                      .HasForeignKey(e => e.CreatedBy)
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
                      .WithMany()
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

                // Relationships
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
                      .HasForeignKey(e => e.CreatedBy)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // StockMovement Configuration
            modelBuilder.Entity<StockMovement>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.MovementDate).HasDefaultValueSql("GETDATE()");

                // Check constraints
                entity.HasCheckConstraint("CK_StockMovements_MovementType",
                    "MovementType IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT')");

                // Relationships
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
                      .HasForeignKey(e => e.CreatedBy)
                      .OnDelete(DeleteBehavior.Restrict);

                // Indexes
                entity.HasIndex(e => new { e.StockItemId, e.MovementDate });
                entity.HasIndex(e => e.LocationId);
                entity.HasIndex(e => e.MovementType);
            });
            // StockBalance Configuration
            modelBuilder.Entity<StockBalance>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.LastUpdateDate).HasDefaultValueSql("GETDATE()");

                // Unique constraint for StockItem + Location combination
                entity.HasIndex(e => new { e.StockItemId, e.LocationId }).IsUnique();

                // Relationships
                entity.HasOne(e => e.StockItem)
                      .WithMany(e => e.StockBalances)
                      .HasForeignKey(e => e.StockItemId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Location)
                      .WithMany(e => e.StockBalances)
                      .HasForeignKey(e => e.LocationId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // StockAlert Configuration
            modelBuilder.Entity<StockAlert>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsRead).HasDefaultValue(false);
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                // Check constraints
                entity.HasCheckConstraint("CK_StockAlerts_AlertType", 
                    "AlertType IN ('LOW_STOCK', 'OVERSTOCK', 'EXPIRED', 'QUALITY_ISSUE')");
                entity.HasCheckConstraint("CK_StockAlerts_AlertLevel", 
                    "AlertLevel IN ('INFO', 'WARNING', 'CRITICAL')");

                // Relationships
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
                      .HasForeignKey(e => e.ReadBy)
                      .OnDelete(DeleteBehavior.Restrict);

                // Indexes
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => new { e.AlertType, e.AlertLevel });
            });

        }

    }
}
