using System.ComponentModel.DataAnnotations;

namespace IvosisProjectManagement.API.DTOs
{
    public class SupplierUpdateDto
    {
        [Required(ErrorMessage = "Şirket adı zorunludur")]
        [StringLength(200, ErrorMessage = "Şirket adı en fazla 200 karakter olabilir")]
        public string CompanyName { get; set; }

        [StringLength(100, ErrorMessage = "Vergi dairesi en fazla 100 karakter olabilir")]
        public string TaxOffice { get; set; }

        [StringLength(500, ErrorMessage = "Adres en fazla 500 karakter olabilir")]
        public string Address { get; set; }

        [StringLength(100, ErrorMessage = "Şehir en fazla 100 karakter olabilir")]
        public string City { get; set; }

        [StringLength(100, ErrorMessage = "İlçe en fazla 100 karakter olabilir")]
        public string District { get; set; }

        [StringLength(10, ErrorMessage = "Posta kodu en fazla 10 karakter olabilir")]
        public string PostalCode { get; set; }

        [StringLength(100, ErrorMessage = "İletişim kişisi en fazla 100 karakter olabilir")]
        public string ContactPerson { get; set; }

        [StringLength(20, ErrorMessage = "İletişim telefonu en fazla 20 karakter olabilir")]
        public string ContactPhone { get; set; }

        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        [StringLength(150, ErrorMessage = "Email en fazla 150 karakter olabilir")]
        public string ContactEmail { get; set; }

        [StringLength(200, ErrorMessage = "Website en fazla 200 karakter olabilir")]
        public string Website { get; set; }

        [Range(0, 365, ErrorMessage = "Ödeme vadesi 0-365 gün arasında olmalıdır")]
        public int? PaymentTerms { get; set; }

        [Range(0, 999999999.99, ErrorMessage = "Kredi limiti geçerli bir değer olmalıdır")]
        public decimal? CreditLimit { get; set; }

        public bool IsActive { get; set; }
    }
}