using System.ComponentModel.DataAnnotations;

namespace IvosisProjectManagement.API.DTOs
{
    public class ProjectDto
    {
        public int Id { get; set; }

        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [StringLength(50)]
        public string? Priority { get; set; }

        [StringLength(50)]
        public string? Status { get; set; }

        // YENİ: Firma bilgileri - BUNLAR EKSİKTİ
        public int? CompanyId { get; set; }
        public string? CompanyName { get; set; }

        // Panel bilgileri
        public int? PanelCount { get; set; }
        public decimal? PanelPower { get; set; }
        public int? PanelBrandId { get; set; }
        public string? PanelBrandName { get; set; } // EKSİKTİ

        // Inverter bilgileri
        public int? InverterCount { get; set; }
        public decimal? InverterPower { get; set; }
        public int? InverterBrandId { get; set; }
        public string? InverterBrandName { get; set; } // EKSİKTİ

        // Ek yapı bilgileri
        public bool HasAdditionalStructure { get; set; }
        public int? AdditionalPanelCount { get; set; }
        public int? AdditionalInverterCount { get; set; }
        public decimal AdditionalPanelPower { get; set; } = 0;

        // YENİ: Elektrik değerleri - BUNLAR EKSİKTİ
        public decimal? AcValue { get; set; }
        public decimal? DcValue { get; set; }

        // Proje türü
        public int? ProjectTypeId { get; set; }
        public string? ProjectTypeName { get; set; }

        // Audit bilgileri
        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public string? CreatedByUserName { get; set; } // EKSİKTİ
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
        public string? UpdatedByUserName { get; set; } // EKSİKTİ
        public List<ProjectAddressDto> Address { get; set; } = new(); // Çoklu adres
         
        public string? ProjeGesType { get; set; }
    }
}
