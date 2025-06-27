using IvosisProjectManagement.API.Data;
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

        public async Task<IEnumerable<Process>> GetAllAsync()
        {
            return await _context.Processes.ToListAsync();
        }

        public async Task<Process?> GetByIdAsync(int id)
        {
            return await _context.Processes.FindAsync(id);
        }

        public async Task<Process> CreateAsync(Process process)
        {
            _context.Processes.Add(process);
            await _context.SaveChangesAsync();
            return process;
        }

        public async Task<bool> UpdateAsync(Process process)
        {
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
