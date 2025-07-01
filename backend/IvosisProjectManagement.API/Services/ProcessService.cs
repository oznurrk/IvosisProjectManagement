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
                ParentProcessId = dto.ParentProcessId
            };

            _context.Processes.Add(process);
            await _context.SaveChangesAsync();

            return new ProcessDto
            {
                Id = process.Id,
                Name = process.Name,
                Description = process.Description,
                ParentProcessId = process.ParentProcessId
            };
        }

        public async Task<bool> UpdateAsync(int id, ProcessUpdateDto dto)
        {
            var process = await _context.Processes.FindAsync(id);
            if (process == null) return false;

            process.Name = dto.Name;
            process.Description = dto.Description ?? string.Empty;

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
    }
}
