// Personnel.cs - Model
using System.ComponentModel.DataAnnotations;

namespace IvosisProjectManagement.API.Models
{
    public class Personnel
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(20)]
        public string SicilNo { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Surname { get; set; }
        
        [StringLength(100)]
        public string? Title { get; set; }
        
        [StringLength(50)]
        public string? Badge { get; set; }
        
        [StringLength(100)]
        public string? Department { get; set; }
        
        [StringLength(100)]
        public string? Section { get; set; }
        
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
        
        [EmailAddress]
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
    }
}

// PersonnelDto.cs
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
        public string WorkStatus { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}

// PersonnelCreateDto.cs
namespace IvosisProjectManagement.API.DTOs
{
    public class PersonnelCreateDto
    {
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
    }
}

// PersonnelUpdateDto.cs
namespace IvosisProjectManagement.API.DTOs
{
    public class PersonnelUpdateDto
    {
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
        public string WorkStatus { get; set; }
    }
}