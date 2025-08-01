using System.ComponentModel.DataAnnotations;

namespace IvosisProjectManagement.API.DTOs
{
    public class UserRegisterDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(200)]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        [MaxLength(100)]
        public string Role { get; set; }

        public int? CompanyId { get; set; }
        public int? DepartmentId { get; set; }
        public List<int>? RoleIds { get; set; }
    }

}
