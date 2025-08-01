using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IvosisProjectManagement.API.Controllers
{
    [ApiController]
    public class BaseController : ControllerBase
    {
        protected int GetCurrentUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdStr, out var userId) ? userId : 0;
        }

        protected int? GetCurrentCompanyId()
        {
            var companyIdStr = User.FindFirst("companyId")?.Value;
            return int.TryParse(companyIdStr, out var companyId) ? companyId : null;
        }

        protected string? GetCurrentCompanyCode()
        {
            return User.FindFirst("companyCode")?.Value;
        }

        protected int? GetCurrentDepartmentId()
        {
            var departmentIdStr = User.FindFirst("departmentId")?.Value;
            return int.TryParse(departmentIdStr, out var departmentId) ? departmentId : null;
        }

        protected List<string> GetCurrentUserRoles()
        {
            return User.FindAll("userRole").Select(c => c.Value).ToList();
        }

        protected List<string> GetCurrentRoleScopes()
        {
            return User.FindAll("roleScope").Select(c => c.Value).ToList();
        }

        protected bool HasGroupAccess()
        {
            return GetCurrentRoleScopes().Contains("GROUP");
        }

        protected bool HasCompanyAccess()
        {
            var scopes = GetCurrentRoleScopes();
            return scopes.Contains("GROUP") || scopes.Contains("COMPANY");
        }

        protected bool HasDepartmentAccess()
        {
            return GetCurrentRoleScopes().Contains("DEPARTMENT");
        }
    }
}