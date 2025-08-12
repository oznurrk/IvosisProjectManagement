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
                .Include(p => p.Address)
                    .ThenInclude(a => a.City)
                .Include(p => p.Address)
                    .ThenInclude(a => a.District)
                .Include(p => p.Address)
                    .ThenInclude(a => a.Neighborhood)
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
                    AcValue = p.AcValue,
                    DcValue = p.DcValue,
                    CompanyId = p.CompanyId,
                    CompanyName = p.Company != null ? p.Company.Name : null,
                    Address = p.Address.Select(a => new ProjectAddressDto
                    {
                        Id = a.Id,
                        CityId = a.CityId,
                        CityName = a.City != null ? a.City.Name : "",
                        DistrictId = a.DistrictId,
                        DistrictName = a.District != null ? a.District.Name : "",
                        NeighborhoodId = a.NeighborhoodId,
                        NeighborhoodName = a.Neighborhood != null ? a.Neighborhood.Name : null,
                        Ada = a.Ada,
                        Parsel = a.Parsel,
                        AdressDetails = a.AdressDetails
                    }).ToList(),
                    ProjectTypeId = p.ProjectTypeId,
                    ProjectTypeName = p.ProjectType != null ? p.ProjectType.Name : null,
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
                    CreatedAt = p.CreatedAt,
                    CreatedBy = p.CreatedBy,
                    CreatedByUserName = p.CreatedByUser != null ? p.CreatedByUser.Name : null,
                    UpdatedAt = p.UpdatedAt,
                    UpdatedBy = p.UpdatedBy,
                    UpdatedByUserName = p.UpdatedByUser != null ? p.UpdatedByUser.Name : null,
                    ProjeGesType = p.ProjeGesType
                }).ToListAsync();
        }

        public async Task<ProjectDto?> GetByIdAsync(int id)
        {
            var project = await _context.Projects
                .Include(p => p.Address)
                    .ThenInclude(a => a.City)
                .Include(p => p.Address)
                    .ThenInclude(a => a.District)
                .Include(p => p.Address)
                    .ThenInclude(a => a.Neighborhood)
                .Include(p => p.Company)
                .Include(p => p.PanelBrand)
                .Include(p => p.InverterBrand)
                .Include(p => p.ProjectType)
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
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
                CompanyId = project.CompanyId,
                CompanyName = project.Company?.Name,
                Address = project.Address.Select(a => new ProjectAddressDto
                {
                    Id = a.Id,
                    CityId = a.CityId,
                    CityName = a.City?.Name ?? "",
                    DistrictId = a.DistrictId,
                    DistrictName = a.District?.Name ?? "",
                    NeighborhoodId = a.NeighborhoodId,
                    NeighborhoodName = a.Neighborhood?.Name,
                    Ada = a.Ada,
                    Parsel = a.Parsel,
                    AdressDetails = a.AdressDetails
                }).ToList(),
                ProjectTypeId = project.ProjectTypeId,
                ProjectTypeName = project.ProjectType?.Name,
                PanelCount = project.PanelCount,
                PanelPower = project.PanelPower,
                PanelBrandId = project.PanelBrandId,
                PanelBrandName = project.PanelBrand?.Name,
                InverterCount = project.InverterCount,
                InverterPower = project.InverterPower,
                InverterBrandId = project.InverterBrandId,
                InverterBrandName = project.InverterBrand?.Name,
                HasAdditionalStructure = project.HasAdditionalStructure,
                AdditionalPanelCount = project.AdditionalPanelCount,
                AdditionalInverterCount = project.AdditionalInverterCount,
                AdditionalPanelPower = project.AdditionalPanelPower,
                CreatedAt = project.CreatedAt,
                CreatedBy = project.CreatedBy,
                CreatedByUserName = project.CreatedByUser?.Name,
                UpdatedAt = project.UpdatedAt,
                UpdatedBy = project.UpdatedBy,
                UpdatedByUserName = project.UpdatedByUser?.Name,
                ProjeGesType = project.ProjeGesType
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
                CreatedBy = dto.CreatedBy,
                CreatedAt = DateTime.UtcNow,
                CompanyId = dto.CompanyId,
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
                ProjeGesType = dto.ProjeGesType,
                Address = dto.Address.Select(a => new ProjectAddress
                {
                    CityId = a.CityId,
                    DistrictId = a.DistrictId,
                    NeighborhoodId = a.NeighborhoodId,
                    Ada = a.Ada,
                    Parsel = a.Parsel,
                    AdressDetails = a.AdressDetails
                }).ToList()
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            // Oluşturulan projeyi tekrar yükle (ilişkili verilerle birlikte)
            var createdProject = await GetByIdAsync(project.Id);
            return createdProject!;
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
            project.EndDate = dto.EndDate ?? DateTime.Now.AddDays(15);
            project.Priority = dto.Priority;
            project.Status = dto.Status;
            project.AcValue = dto.ACValue;
            project.DcValue = dto.DCValue;
            project.UpdatedAt = DateTime.UtcNow;
            project.UpdatedBy = dto.UpdatedBy;
            project.CompanyId = dto.CompanyId;
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
            project.ProjeGesType = dto.ProjeGesType;

            // Mevcut adresleri temizle
            _context.ProjectAddresses.RemoveRange(project.Address);
            
            // Yeni adresleri ekle
            project.Address = dto.Address.Select(a => new ProjectAddress
            {
                ProjectId = id,
                CityId = a.CityId,
                DistrictId = a.DistrictId,
                NeighborhoodId = a.NeighborhoodId,
                Ada = a.Ada,
                Parsel = a.Parsel,
                AdressDetails = a.AdressDetails
            }).ToList();

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
                .Include(p => p.Address)
                    .ThenInclude(a => a.City)
                .Include(p => p.Address)
                    .ThenInclude(a => a.District)
                .Include(p => p.Address)
                    .ThenInclude(a => a.Neighborhood)
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
                    Address = p.Address.Select(a => new ProjectAddressDto
                    {
                        Id = a.Id,
                        CityId = a.CityId,
                        CityName = a.City != null ? a.City.Name : "",
                        DistrictId = a.DistrictId,
                        DistrictName = a.District != null ? a.District.Name : "",
                        NeighborhoodId = a.NeighborhoodId,
                        NeighborhoodName = a.Neighborhood != null ? a.Neighborhood.Name : null,
                        Ada = a.Ada,
                        Parsel = a.Parsel,
                        AdressDetails = a.AdressDetails
                    }).ToList(),
                    CreatedAt = p.CreatedAt,
                    CreatedBy = p.CreatedBy,
                    CreatedByUserName = p.CreatedByUser != null ? p.CreatedByUser.Name : null,
                    UpdatedAt = p.UpdatedAt,
                    UpdatedBy = p.UpdatedBy,
                    UpdatedByUserName = p.UpdatedByUser != null ? p.UpdatedByUser.Name : null,
                    ProjeGesType = p.ProjeGesType
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
                .Include(p => p.Address)
                    .ThenInclude(a => a.City)
                .Include(p => p.Address)
                    .ThenInclude(a => a.District)
                .Include(p => p.Address)
                    .ThenInclude(a => a.Neighborhood)
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
                    Address = p.Address.Select(a => new ProjectAddressDto
                    {
                        Id = a.Id,
                        CityId = a.CityId,
                        CityName = a.City != null ? a.City.Name : "",
                        DistrictId = a.DistrictId,
                        DistrictName = a.District != null ? a.District.Name : "",
                        NeighborhoodId = a.NeighborhoodId,
                        NeighborhoodName = a.Neighborhood != null ? a.Neighborhood.Name : null,
                        Ada = a.Ada,
                        Parsel = a.Parsel,
                        AdressDetails = a.AdressDetails
                    }).ToList(),
                    CreatedAt = p.CreatedAt,
                    CreatedBy = p.CreatedBy,
                    CreatedByUserName = p.CreatedByUser != null ? p.CreatedByUser.Name : null,
                    UpdatedAt = p.UpdatedAt,
                    UpdatedBy = p.UpdatedBy,
                    UpdatedByUserName = p.UpdatedByUser != null ? p.UpdatedByUser.Name : null,
                    ProjeGesType = p.ProjeGesType
                })
                .ToListAsync();

            return projects;
        }
    }
}
