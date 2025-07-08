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
            return await _context.Projects.Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Priority = p.Priority,
                Status = p.Status,

                // Yeni alanlar
                ACValue = p.ACValue,
                DCValue = p.DCValue,
                CityId = p.CityId,
                DistrictId = p.DistrictId,
                NeighborhoodId = p.NeighborhoodId,
                Ada = p.Ada,
                Parsel = p.Parsel,
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
            var project = await _context.Projects.FindAsync(id);
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

                ACValue = project.ACValue,
                DCValue = project.DCValue,
                CityId = project.CityId,
                DistrictId = project.DistrictId,
                NeighborhoodId = project.NeighborhoodId,
                Ada = project.Ada,
                Parsel = project.Parsel,
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
                EndDate = dto.EndDate,
                Priority = dto.Priority,
                Status = dto.Status,
                CreatedByUserId = dto.CreatedByUserId,
                CreatedAt = DateTime.UtcNow,

                ACValue = dto.ACValue,
                DCValue = dto.ACValue,
                CityId = dto.CityId,
                DistrictId = dto.DistrictId,
                NeighborhoodId = dto.NeighborhoodId,
                Ada = dto.Ada,
                Parsel = dto.Parsel,
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
                AdditionalPanelPower = dto.AdditionalPanelPower
            };


            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                Priority = project.Priority,
                Status = project.Status,

                ACValue = dto.ACValue,
                DCValue = dto.ACValue,
                CityId = dto.CityId,
                DistrictId = dto.DistrictId,
                NeighborhoodId = dto.NeighborhoodId,
                Ada = dto.Ada,
                Parsel = dto.Parsel,
                ProjectTypeId = dto.ProjectTypeId,

                PanelCount = dto.PanelCount,
                PanelPower = dto.PanelPower,
                PanelBrandId = dto.PanelBrandId,
                InverterCount = dto.InverterCount,
                InverterPower = dto.InverterPower,
                InverterBrandId = dto.InverterBrandId,
                HasAdditionalStructure = dto.HasAdditionalStructure,
                AdditionalPanelCount = dto.AdditionalPanelCount,
                AdditionalInverterCount = dto.AdditionalInverterCount,
                AdditionalPanelPower = dto.AdditionalPanelPower,
                CreatedAt = DateTime.Now,
                CreatedByUserId = dto.CreatedByUserId
            };
        }

        public async Task<bool> UpdateAsync(int id, ProjectUpdateDto dto)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return false;

            project.Name = dto.Name;
            project.Description = dto.Description;
            project.StartDate = dto.StartDate;
            project.EndDate = dto.EndDate;
            project.Priority = dto.Priority;
            project.Status = dto.Status;
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
            project.AdditionalPanelPower = dto.AdditionalPanelPower;
            project.UpdatedAt = DateTime.Now;
            project.UpdatedByUserId = dto.UpdatedByUserId;

            _context.Projects.Update(project);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return false;

            _context.Projects.Remove(project);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
