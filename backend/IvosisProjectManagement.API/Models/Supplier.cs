using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IvosisProjectManagement.API.Models
{
    public class Supplier : CompanyEntity
    {
        [Required, StringLength(200)]
        public string CompanyName { get; set; }

        [StringLength(20)]
        public string TaxNumber { get; set; }

        [StringLength(100)]
        public string TaxOffice { get; set; }

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

        [StringLength(200)]
        public string Website { get; set; }

        public int? PaymentTerms { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CreditLimit { get; set; }

        public bool IsActive { get; set; } = true;
        public virtual ICollection<SupplierCompany> SupplierCompanies { get; set; } = new List<SupplierCompany>();
    }
}