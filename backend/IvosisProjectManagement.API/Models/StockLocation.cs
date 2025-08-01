using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using IvosisProjectManagement.API.Models;

public class StockLocation : BaseEntity
    {
        [Required, StringLength(100)]
        public string Name { get; set; }
        
        [Required, StringLength(20)]
        public string Code { get; set; }
        
        [StringLength(500)]
        public string Address { get; set; }
        
        [StringLength(50)]
        public string City { get; set; }
        
        [StringLength(50)]
        public string District { get; set; }
        
        [StringLength(10)]
        public string PostalCode { get; set; }
        
        [StringLength(100)]
        public string ContactPerson { get; set; }
        
        [StringLength(20)]
        public string ContactPhone { get; set; }
        
        [StringLength(100)]
        public string ContactEmail { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? Capacity { get; set; }
        
        [StringLength(10)]
        public string CapacityUnit { get; set; }
        
        public bool IsActive { get; set; } = true;
          public int CreatedByUserId { get; set; }

        [ForeignKey("CreatedByUserId")]
        public User CreatedByUser { get; set; }

        // Navigation properties
    public virtual ICollection<StockBalance> StockBalances { get; set; }
        public virtual ICollection<StockMovement> StockMovements { get; set; }
    }