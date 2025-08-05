using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace IvosisProjectManagement.API.Models
{
    public class Project
    {
        public int Id { get; set; }

        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        [StringLength(50)]
        public string? Priority { get; set; }

        [StringLength(50)]
        public string? Status { get; set; }

        // Yeni firma bilgisi
        public int? CompanyId { get; set; }

        // Panel bilgileri
        public int? PanelCount { get; set; }
        public decimal? PanelPower { get; set; }
        public int? PanelBrandId { get; set; }

        // Inverter bilgileri
        public int? InverterCount { get; set; }
        public decimal? InverterPower { get; set; }
        public int? InverterBrandId { get; set; }

        // Ek yapı bilgileri
        public bool HasAdditionalStructure { get; set; }
        public int? AdditionalPanelCount { get; set; }
        public int? AdditionalInverterCount { get; set; }
        public decimal AdditionalPanelPower { get; set; } = 0;

        // Elektrik değerleri
        public decimal? AcValue { get; set; }
        public decimal? DcValue { get; set; }

        // Proje türü
        public int? ProjectTypeId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public int? CreatedByUserId { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedByUserId { get; set; }

        // Navigation Properties
        public virtual Company? Company { get; set; }
        public virtual PanelBrand? PanelBrand { get; set; }
        public virtual InverterBrand? InverterBrand { get; set; }
        public virtual ProjectType? ProjectType { get; set; }
        public virtual User? CreatedByUser { get; set; }
        public virtual User? UpdatedByUser { get; set; }

        public virtual ICollection<ProjectTask> ProjectTasks { get; set; } = new List<ProjectTask>();

        public List<ProjectAddress> Address { get; set; } = new(); // Çoklu adres

        public string? ProjeGesType { get; set; }
    }
}