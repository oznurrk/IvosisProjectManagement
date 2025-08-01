using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace IvosisProjectManagement.API.Services
{
    public class ProcessService : IProcessService
    {
        private readonly ApplicationDbContext _context;

        public ProcessService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProcessDto>> GetAllAsync()
        {
            return await _context.Processes
                .Select(p => new ProcessDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    ParentProcessId = p.ParentProcessId
                })
                .ToListAsync();
        }

        public async Task<ProcessDto?> GetByIdAsync(int id)
        {
            var p = await _context.Processes.FindAsync(id);
            if (p == null) return null;
            return new ProcessDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                ParentProcessId = p.ParentProcessId
            };
        }

        public async Task<ProcessDto> CreateAsync(ProcessCreateDto dto)
        {
            var process = new Process
            {
                Name = dto.Name,
                Description = dto.Description ?? string.Empty,
                ParentProcessId = dto.ParentProcessId,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = dto.CreatedByUserId
            };

            _context.Processes.Add(process);
            await _context.SaveChangesAsync();

            return new ProcessDto
            {
                Id = process.Id,
                Name = process.Name,
                Description = process.Description,
                ParentProcessId = process.ParentProcessId,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = process.CreatedByUserId
            };
        }

        public async Task<bool> UpdateAsync(int id, ProcessUpdateDto dto)
        {
            var process = await _context.Processes.FindAsync(id);
            if (process == null) return false;

            process.Name = dto.Name;
            process.Description = dto.Description ?? string.Empty;
            process.UpdatedAt = DateTime.Now;
            process.UpdatedByUserId = dto.UpdatedByUserId;

            _context.Processes.Update(process);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var process = await _context.Processes.FindAsync(id);
            if (process == null) return false;

            _context.Processes.Remove(process);
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<List<ProcessDto>> GetProcessesByCompaniesAsync(List<int> companyIds)
        {
            if (!companyIds.Any()) return new List<ProcessDto>();

            var processes = await _context.Processes
                .Where(p => companyIds.Contains(p.CompanyId ?? 0) || p.CompanyId == null) // null olanlar ortak süreçler
                .Include(p => p.ParentProcess)
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
                .Select(p => new ProcessDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    ParentProcessId = p.ParentProcessId,
                    ParentProcessName = p.ParentProcess != null ? p.ParentProcess.Name : null,
                    CompanyId = p.CompanyId,
                    CreatedAt = p.CreatedAt,
                    CreatedByUserId = p.CreatedByUserId,
                    CreatedByUserName = p.CreatedByUser != null ? p.CreatedByUser.Name : null,
                    UpdatedAt = p.UpdatedAt,
                    UpdatedByUserId = p.UpdatedByUserId,
                    UpdatedByUserName = p.UpdatedByUser != null ? p.UpdatedByUser.Name : null
                })
                .ToListAsync();

            return processes;
        }
    }
}
