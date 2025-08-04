using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IvosisProjectManagement.API.Models
{
    public class SupplierCompany
    {
        public int Id { get; set; }
        public int SupplierId { get; set; }
        public int CompanyId { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public int CreatedBy { get; set; }
        
        // Navigation Properties - ForeignKey attribute'ları KALDıRıLDı
        public virtual Supplier Supplier { get; set; } = null!;
        public virtual Company Company { get; set; } = null!;
        public virtual User CreatedByUser { get; set; } = null!;
    }
}