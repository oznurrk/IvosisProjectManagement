using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using IvosisProjectManagement.API.Models;

namespace IvosisProjectManagement.API.DTOs
{
    public class PersonnelDto
    {
        public int Id { get; set; }
        public string SicilNo { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string? Title { get; set; }
        public string? Badge { get; set; }
        public string? Department { get; set; }
        public string? Section { get; set; }
        public DateTime? StartDate { get; set; }
        public string? BirthPlace { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? TCKimlikNo { get; set; }
        public string? EducationLevel { get; set; }
        public string? Gender { get; set; }
        public string? Nationality { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? Address { get; set; }
        public string? MobilePhone { get; set; }
        public string? Email { get; set; }
        public decimal? Salary { get; set; }
        public string? IBAN { get; set; }
        public string? Photo { get; set; }
        public string WorkStatus { get; set; } = "Aktif";
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public int? CompanyId { get; set; }
        public int? DepartmentId { get; set; }

        // Navigation property de ekleyin:
        [ForeignKey("DepartmentId")]
        public virtual Department? DepartmentEntity { get; set; }
        public string? CompanyName { get; set; }
        public string? DepartmentName { get; set; }
        
    }
    public class PersonnelCreateDto
    {
        [Required]
        public string SicilNo { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Surname { get; set; } = string.Empty;

        public string? Title { get; set; }
        public string? Badge { get; set; }
        public string? Section { get; set; }
        public string? Department { get; set; }

        // Yeni firma bilgisi
        public int? CompanyId { get; set; }
        public int? DepartmentId { get; set; }

        public DateTime? StartDate { get; set; }
        public string? BirthPlace { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? TCKimlikNo { get; set; }
        public string? EducationLevel { get; set; }
        public string? Gender { get; set; }
        public string? Nationality { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? Address { get; set; }
        public string? MobilePhone { get; set; }
        public string? Email { get; set; }
        public string WorkStatus { get; set; }
        public decimal? Salary { get; set; }
        public string? IBAN { get; set; }
        public string? Photo { get; set; }
    }
    
    public class PersonnelUpdateDto
    {
        public string SicilNo { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string? Title { get; set; }
        public string? Badge { get; set; }
        public string? Department { get; set; }
        public string? Section { get; set; }
        public int? CompanyId { get; set; }
        public int? DepartmentId { get; set; }
        public DateTime? StartDate { get; set; }
        public string? BirthPlace { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? TCKimlikNo { get; set; }
        public string? EducationLevel { get; set; }
        public string? Gender { get; set; }
        public string? Nationality { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? Address { get; set; }
        public string? MobilePhone { get; set; }
        public string? Email { get; set; }
        public decimal? Salary { get; set; }
        public string? IBAN { get; set; }
        public string? Photo { get; set; }
        public string WorkStatus { get; set; } = "Aktif";

    }

}