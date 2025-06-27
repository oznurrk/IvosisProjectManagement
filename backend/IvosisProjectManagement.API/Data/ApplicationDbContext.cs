using Microsoft.EntityFrameworkCore;
using IvosisProjectManagement.API.Models;

namespace IvosisProjectManagement.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Models.User> Users { get; set; }
        public DbSet<Models.Processes> Processes { get; set; }
        public DbSet<Models.TaskItem> Tasks { get; set; }
    }
}
