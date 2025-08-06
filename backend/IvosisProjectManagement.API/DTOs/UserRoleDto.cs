public class UserRoleDto
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string RoleCode { get; set; } = string.Empty;
        public string Scope { get; set; } = string.Empty;
        public int? CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
    }