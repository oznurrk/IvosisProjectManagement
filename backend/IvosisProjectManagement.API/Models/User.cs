using System.ComponentModel.DataAnnotations;

namespace IvosisProjectManagement.API.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(200)]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        [MaxLength(100)]
        public string Role { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

          // Navigation properties
        public virtual ICollection<StockItem> CreatedStockItems { get; set; }
        public virtual ICollection<StockMovement> StockMovements { get; set; }
    }

}