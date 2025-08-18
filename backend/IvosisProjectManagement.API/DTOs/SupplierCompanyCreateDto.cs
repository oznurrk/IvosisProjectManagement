using System.ComponentModel.DataAnnotations;

namespace IvosisProjectManagement.API.DTOs
{
    public class SupplierCompanyCreateDto
    {
        [Required(ErrorMessage = "Tedarikçi ID zorunludur")]
        public int SupplierId { get; set; }

        [Required(ErrorMessage = "Şirket ID zorunludur")]
        public int CompanyId { get; set; }

        public bool IsActive { get; set; } = true;
    }
}