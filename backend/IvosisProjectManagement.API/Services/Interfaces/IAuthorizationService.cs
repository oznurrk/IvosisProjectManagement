public interface IAuthorizationService
{
    Task<List<int>> GetUserAccessibleCompaniesAsync(int userId);
    Task<List<int>> GetUserAccessibleDepartmentsAsync(int userId);
    Task<bool> CanUserAccessCompanyAsync(int userId, int companyId);
    Task<bool> CanUserAccessDepartmentAsync(int userId, int departmentId);
    Task<bool> HasPermissionAsync(int userId, string permission, int? companyId = null, int? departmentId = null);
    
}