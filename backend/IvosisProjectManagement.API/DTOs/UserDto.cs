namespace IvosisProjectManagement.API.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Email { get; set; }

        public string Role { get; set; }

        public DateTime CreatedAt { get; set; }

        public int? CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyCode { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public List<UserRoleDto>? UserRoles { get; set; }
    }

    
}