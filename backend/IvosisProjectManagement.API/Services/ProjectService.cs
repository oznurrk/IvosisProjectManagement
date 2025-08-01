using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Models;
using IvosisProjectManagement.API.DTOs;
using Microsoft.EntityFrameworkCore;


namespace IvosisProjectManagement.API.Services
{
    public class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _context;

        public ProjectService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProjectDto>> GetAllAsync()
        {
            return await _context.Projects
                .Include(p => p.Address) // Çoklu adresler dahil
                .Select(p => new ProjectDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Priority = p.Priority,
                    Status = p.Status,
                    AcValue = p.AcValue,
                    DcValue = p.DcValue,
                    Address = p.Address.Select(a => new ProjectAddressDto
                    {
                        CityId = a.CityId,
                        DistrictId = a.DistrictId,
                        NeighborhoodId = a.NeighborhoodId,
                        Ada = a.Ada,
                        Parsel = a.Parsel
                    }).ToList(),
                    ProjectTypeId = p.ProjectTypeId,
                    PanelCount = p.PanelCount,
                    PanelPower = p.PanelPower,
                    PanelBrandId = p.PanelBrandId,
                    InverterCount = p.InverterCount,
                    InverterPower = p.InverterPower,
                    InverterBrandId = p.InverterBrandId,
                    HasAdditionalStructure = p.HasAdditionalStructure,
                    AdditionalPanelCount = p.AdditionalPanelCount,
                    AdditionalInverterCount = p.AdditionalInverterCount,
                    AdditionalPanelPower = p.AdditionalPanelPower,
                    CreatedAt = p.CreatedAt,
                    CreatedByUserId = p.CreatedByUserId,
                    UpdatedAt = p.UpdatedAt
                }).ToListAsync();
        }

        public async Task<ProjectDto?> GetByIdAsync(int id)
        {
            var project = await _context.Projects
                .Include(p => p.Address)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null) return null;

            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                Priority = project.Priority,
                Status = project.Status,
                AcValue = project.AcValue,
                DcValue = project.DcValue,
                Address = project.Address.Select(a => new ProjectAddressDto
                {
                    CityId = a.CityId,
                    DistrictId = a.DistrictId,
                    NeighborhoodId = a.NeighborhoodId,
                    Ada = a.Ada,
                    Parsel = a.Parsel
                }).ToList(),
                ProjectTypeId = project.ProjectTypeId,
                PanelCount = project.PanelCount,
                PanelPower = project.PanelPower,
                PanelBrandId = project.PanelBrandId,
                InverterCount = project.InverterCount,
                InverterPower = project.InverterPower,
                InverterBrandId = project.InverterBrandId,
                HasAdditionalStructure = project.HasAdditionalStructure,
                AdditionalPanelCount = project.AdditionalPanelCount,
                AdditionalInverterCount = project.AdditionalInverterCount,
                AdditionalPanelPower = project.AdditionalPanelPower,
                CreatedAt = project.CreatedAt,
                CreatedByUserId = project.CreatedByUserId,
                UpdatedAt = project.UpdatedAt
            };
        }

        public async Task<ProjectDto> CreateAsync(ProjectCreateDto dto)
        {
            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate ?? DateTime.Now.AddDays(15), 
                Priority = dto.Priority,
                Status = dto.Status,
                CreatedByUserId = dto.CreatedByUserId,
                CreatedAt = DateTime.UtcNow,
                AcValue = dto.ACValue,
                DcValue = dto.DCValue,
                ProjectTypeId = dto.ProjectTypeId,
                PanelCount = dto.PanelCount,
                PanelPower = dto.PanelPower,
                PanelBrandId = dto.PanelBrandId,
                InverterCount = dto.InverterCount,
                InverterPower = dto.InverterPower,
                InverterBrandId = dto.InverterBrandId,
                HasAdditionalStructure = dto.HasAdditionalStructure ?? false,
                AdditionalPanelCount = dto.AdditionalPanelCount,
                AdditionalInverterCount = dto.AdditionalInverterCount,
                AdditionalPanelPower = dto.AdditionalPanelPower ?? 0,
                Address = dto.Address.Select(a => new ProjectAddress
                {
                    CityId = a.CityId,
                    DistrictId = a.DistrictId,
                    NeighborhoodId = a.NeighborhoodId,
                    Ada = a.Ada,
                    Parsel = a.Parsel
                }).ToList()
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                StartDate = project.StartDate,
                EndDate = project.EndDate ,
                Priority = project.Priority,
                Status = project.Status,
                AcValue = project.AcValue,
                DcValue = project.DcValue,
                ProjectTypeId = project.ProjectTypeId,
                Address = project.Address.Select(a => new ProjectAddressDto
                {
                    CityId = a.CityId,
                    DistrictId = a.DistrictId,
                    NeighborhoodId = a.NeighborhoodId,
                    Ada = a.Ada,
                    Parsel = a.Parsel
                }).ToList(),
                PanelCount = project.PanelCount,
                PanelPower = project.PanelPower,
                PanelBrandId = project.PanelBrandId,
                InverterCount = project.InverterCount,
                InverterPower = project.InverterPower,
                InverterBrandId = project.InverterBrandId,
                HasAdditionalStructure = project.HasAdditionalStructure,
                AdditionalPanelCount = project.AdditionalPanelCount,
                AdditionalInverterCount = project.AdditionalInverterCount,
                AdditionalPanelPower = project.AdditionalPanelPower,
                CreatedAt = project.CreatedAt,
                CreatedByUserId = project.CreatedByUserId ?? 0
            };
        }

        public async Task<bool> UpdateAsync(int id, ProjectUpdateDto dto)
        {
            var project = await _context.Projects
                .Include(p => p.Address)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null) return false;

            project.Name = dto.Name;
            project.Description = dto.Description;
            project.StartDate = dto.StartDate;
            project.EndDate =  dto.EndDate ?? DateTime.Now.AddDays(15);
            project.Priority = dto.Priority;
            project.Status = dto.Status;
            project.AcValue = dto.ACValue;
            project.DcValue = dto.DCValue;
            project.UpdatedAt = DateTime.UtcNow;
            project.UpdatedByUserId = dto.UpdatedByUserId;
            project.PanelCount = dto.PanelCount;
            project.PanelPower = dto.PanelPower;
            project.PanelBrandId = dto.PanelBrandId;
            project.InverterCount = dto.InverterCount;
            project.InverterPower = dto.InverterPower;
            project.InverterBrandId = dto.InverterBrandId;
            project.HasAdditionalStructure = dto.HasAdditionalStructure ?? false;
            project.AdditionalPanelCount = dto.AdditionalPanelCount;
            project.AdditionalInverterCount = dto.AdditionalInverterCount;
            project.AdditionalPanelPower = dto.AdditionalPanelPower ?? 0;

            project.Address.Clear();
            foreach (var a in dto.Address)
            {
                project.Address.Add(new ProjectAddress
                {
                    CityId = a.CityId,
                    DistrictId = a.DistrictId,
                    NeighborhoodId = a.NeighborhoodId,
                    Ada = a.Ada,
                    Parsel = a.Parsel
                });
            }

            _context.Projects.Update(project);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var project = await _context.Projects.Include(p => p.Address).FirstOrDefaultAsync(p => p.Id == id);
            if (project == null) return false;

            _context.Projects.Remove(project);
            return await _context.SaveChangesAsync() > 0;
        }

         public async Task<List<ProjectDto>> GetProjectsByCompaniesAsync(List<int> companyIds)
        {
            if (!companyIds.Any()) return new List<ProjectDto>();

            var projects = await _context.Projects
                .Where(p => companyIds.Contains(p.CompanyId ?? 0))
                .Include(p => p.Company)
                .Include(p => p.PanelBrand)
                .Include(p => p.InverterBrand)
                .Include(p => p.ProjectType)
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
                .Select(p => new ProjectDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Priority = p.Priority,
                    Status = p.Status,
                    CompanyId = p.CompanyId,
                    CompanyName = p.Company != null ? p.Company.Name : null,
                    PanelCount = p.PanelCount,
                    PanelPower = p.PanelPower,
                    PanelBrandId = p.PanelBrandId,
                    PanelBrandName = p.PanelBrand != null ? p.PanelBrand.Name : null,
                    InverterCount = p.InverterCount,
                    InverterPower = p.InverterPower,
                    InverterBrandId = p.InverterBrandId,
                    InverterBrandName = p.InverterBrand != null ? p.InverterBrand.Name : null,
                    HasAdditionalStructure = p.HasAdditionalStructure,
                    AdditionalPanelCount = p.AdditionalPanelCount,
                    AdditionalInverterCount = p.AdditionalInverterCount,
                    AdditionalPanelPower = p.AdditionalPanelPower,
                    AcValue = p.AcValue,
                    DcValue = p.DcValue,
                    ProjectTypeId = p.ProjectTypeId,
                    ProjectTypeName = p.ProjectType != null ? p.ProjectType.Name : null,
                    CreatedAt = p.CreatedAt,
                    CreatedByUserId = p.CreatedByUserId,
                    CreatedByUserName = p.CreatedByUser != null ? p.CreatedByUser.Name : null,
                    UpdatedAt = p.UpdatedAt,
                    UpdatedByUserId = p.UpdatedByUserId,
                    UpdatedByUserName = p.UpdatedByUser != null ? p.UpdatedByUser.Name : null
                })
                .ToListAsync();

            return projects;
        }

        public async Task<List<ProjectDto>> GetProjectsByCompanyAsync(int companyId)
        {
            return await GetProjectsByCompaniesAsync(new List<int> { companyId });
        }

        public async Task<List<ProjectDto>> GetProductionProjectsAsync(int companyId)
        {
            var projects = await _context.Projects
                .Where(p => p.CompanyId == companyId && 
                           (p.Status == "Üretim" || p.Status == "Production" || 
                            p.Name!.Contains("Üretim") || p.Name.Contains("Production")))
                .Include(p => p.Company)
                .Include(p => p.PanelBrand)
                .Include(p => p.InverterBrand)
                .Include(p => p.ProjectType)
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
                .Select(p => new ProjectDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Priority = p.Priority,
                    Status = p.Status,
                    CompanyId = p.CompanyId,
                    CompanyName = p.Company != null ? p.Company.Name : null,
                    PanelCount = p.PanelCount,
                    PanelPower = p.PanelPower,
                    PanelBrandId = p.PanelBrandId,
                    PanelBrandName = p.PanelBrand != null ? p.PanelBrand.Name : null,
                    InverterCount = p.InverterCount,
                    InverterPower = p.InverterPower,
                    InverterBrandId = p.InverterBrandId,
                    InverterBrandName = p.InverterBrand != null ? p.InverterBrand.Name : null,
                    HasAdditionalStructure = p.HasAdditionalStructure,
                    AdditionalPanelCount = p.AdditionalPanelCount,
                    AdditionalInverterCount = p.AdditionalInverterCount,
                    AdditionalPanelPower = p.AdditionalPanelPower,
                    AcValue = p.AcValue,
                    DcValue = p.DcValue,
                    ProjectTypeId = p.ProjectTypeId,
                    ProjectTypeName = p.ProjectType != null ? p.ProjectType.Name : null,
                    CreatedAt = p.CreatedAt,
                    CreatedByUserId = p.CreatedByUserId,
                    CreatedByUserName = p.CreatedByUser != null ? p.CreatedByUser.Name : null,
                    UpdatedAt = p.UpdatedAt,
                    UpdatedByUserId = p.UpdatedByUserId,
                    UpdatedByUserName = p.UpdatedByUser != null ? p.UpdatedByUser.Name : null
                })
                .ToListAsync();

            return projects;
        }
    }
}
