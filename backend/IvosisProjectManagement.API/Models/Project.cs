using System.ComponentModel.DataAnnotations;
namespace IvosisProjectManagement.API.Models
{
    public class Project : CompanyEntity
    {

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
        public string? ProjeGesType { get; set; }

        public virtual PanelBrand? PanelBrand { get; set; }
        public virtual InverterBrand? InverterBrand { get; set; }
        public virtual ProjectType? ProjectType { get; set; }
        public virtual ICollection<ProjectTask> ProjectTasks { get; set; } = new List<ProjectTask>();
        public List<ProjectAddress> Address { get; set; } = new(); // Çoklu adres
        
    }
}