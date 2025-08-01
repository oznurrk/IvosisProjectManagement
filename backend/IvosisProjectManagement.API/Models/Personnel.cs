using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IvosisProjectManagement.API.Models
{
    public class Personnel
    {
        public int Id { get; set; }

        [Required]
        [StringLength(20)]
        public string SicilNo { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Surname { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Title { get; set; }

        [StringLength(50)]
        public string? Badge { get; set; }

        [StringLength(100)]
        public string? Section { get; set; }

        [StringLength(100)]
        public string? Department { get; set; }

        // Yeni firma bilgisi
        public int? CompanyId { get; set; }
        public int? DepartmentId { get; set; }

        public DateTime? StartDate { get; set; }

        [StringLength(100)]
        public string? BirthPlace { get; set; }

        public DateTime? BirthDate { get; set; }

        [StringLength(11)]
        public string? TCKimlikNo { get; set; }

        [StringLength(100)]
        public string? EducationLevel { get; set; }

        [StringLength(10)]
        public string? Gender { get; set; }

        [StringLength(50)]
        public string? Nationality { get; set; }

        [StringLength(50)]
        public string? City { get; set; }

        [StringLength(50)]
        public string? District { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(20)]
        public string? MobilePhone { get; set; }

        [StringLength(150)]
        public string? Email { get; set; }

        public decimal? Salary { get; set; }

        [StringLength(26)]
        public string? IBAN { get; set; }

        [StringLength(255)]
        public string? Photo { get; set; }

        [StringLength(20)]
        public string WorkStatus { get; set; } = "Aktif";

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;

        // Navigation Properties
        [ForeignKey("CompanyId")]
        public virtual Company? Company { get; set; }

        [ForeignKey("DepartmentId")]
        public virtual Department? DepartmentEntity { get; set; }
    }
}