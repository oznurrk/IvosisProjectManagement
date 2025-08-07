using IvosisProjectManagement.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

public class AuthorizationService : IAuthorizationService
{
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;

    public AuthorizationService(ApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<List<int>> GetUserAccessibleCompaniesAsync(int userId)
    {
       var cacheKey = $"user_companies_{userId}";
            
            if (_cache.TryGetValue(cacheKey, out List<int>? cachedCompanies) && cachedCompanies != null)
                return cachedCompanies;

            var user = await _context.Users
                .Include(u => u.UserRoles.Where(ur => ur.IsActive))
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return new List<int>();

            var accessibleCompanies = new HashSet<int>();

            foreach (var userRole in user.UserRoles)
            {
                var role = userRole.Role;
                
                switch (role.Scope)
                {
                    case "GROUP":
                        // Grup seviyesi - tüm firmaları görebilir
                        var allCompanies = await _context.Companies
                            .Where(c => c.IsActive)
                            .Select(c => c.Id)
                            .ToListAsync();
                        foreach (var companyId in allCompanies)
                            accessibleCompanies.Add(companyId);
                        break;

                    case "COMPANY":
                        // Firma seviyesi - belirtilen firmayı veya kendi firmasını görebilir
                        if (userRole.CompanyId.HasValue)
                            accessibleCompanies.Add(userRole.CompanyId.Value);
                        else if (user.CompanyId.HasValue)
                            accessibleCompanies.Add(user.CompanyId.Value);
                        break;

                    case "DEPARTMENT":
                        // Departman seviyesi - sadece kendi firmasını görebilir
                        if (user.CompanyId.HasValue)
                            accessibleCompanies.Add(user.CompanyId.Value);
                        break;
                }
            }

            var result = accessibleCompanies.ToList();
            
            // Cache for 10 minutes
            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(10));
            
            return result;
        }

    public async Task<List<int>> GetUserAccessibleDepartmentsAsync(int userId)
    {
        var cacheKey = $"user_departments_{userId}";
            
            if (_cache.TryGetValue(cacheKey, out List<int>? cachedDepartments) && cachedDepartments != null)
                return cachedDepartments;

            var user = await _context.Users
                .Include(u => u.UserRoles.Where(ur => ur.IsActive))
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return new List<int>();

            var accessibleDepartments = new HashSet<int>();

            // Önce erişilebilir firmaları al
            var accessibleCompanies = await GetUserAccessibleCompaniesAsync(userId);
            

            foreach (var userRole in user.UserRoles)
            {
                var role = userRole.Role;
                
                switch (role.Scope)
                {
                    case "GROUP":
                    case "COMPANY":
                        // Grup ve firma seviyesi - erişilebilir firmaların tüm departmanlarını görebilir
                        var departments = await _context.Departments
                            .Where(d => d.IsActive && d.CompanyId.HasValue && accessibleCompanies.Contains(d.CompanyId.Value))
                            .Select(d => d.Id)
                            .ToListAsync();
                        foreach (var deptId in departments)
                            accessibleDepartments.Add(deptId);
                        break;

                    case "DEPARTMENT":
                        // Departman seviyesi - sadece belirtilen departmanı veya kendi departmanını görebilir
                        if (userRole.DepartmentId.HasValue)
                            accessibleDepartments.Add(userRole.DepartmentId.Value);
                        else if (user.DepartmentId.HasValue)
                            accessibleDepartments.Add(user.DepartmentId.Value);
                        break;
                }
            }

            var result = accessibleDepartments.ToList();
            
            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(10));
            
            return result;
    }

    public async Task<bool> CanUserAccessCompanyAsync(int userId, int companyId)
    {
        var accessibleCompanies = await GetUserAccessibleCompaniesAsync(userId);
        return accessibleCompanies.Contains(companyId);
    }

    public async Task<bool> CanUserAccessDepartmentAsync(int userId, int departmentId)
    {
        var accessibleDepartments = await GetUserAccessibleDepartmentsAsync(userId);
        return accessibleDepartments.Contains(departmentId);
    }

    public async Task<bool> HasPermissionAsync(int userId, string permission, int? companyId = null, int? departmentId = null)
    {
        var user = await _context.Users
                .Include(u => u.UserRoles.Where(ur => ur.IsActive))
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return false;

            foreach (var userRole in user.UserRoles)
            {
                var role = userRole.Role;
                
                // Basit permission kontrolü (gelişmiş JSON permission sistemine geçilebilir)
                if (role.Code.Contains(permission.ToUpper()) || 
                    role.Name.Contains(permission, StringComparison.OrdinalIgnoreCase))
                {
                    // Scope kontrolü
                    if (companyId.HasValue)
                    {
                        switch (role.Scope)
                        {
                            case "GROUP":
                                return true; // Grup seviyesi her şeye erişebilir
                            case "COMPANY":
                                return userRole.CompanyId == companyId || user.CompanyId == companyId;
                            case "DEPARTMENT":
                                return user.CompanyId == companyId;
                        }
                    }
                    else
                    {
                        return true; // Company belirtilmemişse genel izin var
                    }
                }
            }

            return false;
    }
}
