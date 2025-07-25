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
            
            modelBuilder.Entity<ProjectTask>() // veya ProjectAddress
            .Property(e => e.FilePath)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => string.IsNullOrWhiteSpace(v)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null));

        }

    }
}
