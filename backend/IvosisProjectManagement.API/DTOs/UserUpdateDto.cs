using System.ComponentModel.DataAnnotations;

namespace IvosisProjectManagement.API.DTOs
{
   public class UserUpdateDto
    {
        [Required]
        public int Id { get; set; }

        [MaxLength(100)]
        public string Name { get; set; }

        [EmailAddress]
        [MaxLength(200)]
        public string Email { get; set; }

        [MaxLength(100)]
        public string Role { get; set; }

        public string? NewPassword { get; set; }
    }

}
