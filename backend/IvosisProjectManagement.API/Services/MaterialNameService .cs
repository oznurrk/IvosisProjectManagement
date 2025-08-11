// MaterialNameService.cs
using AutoMapper;
using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace IvosisProjectManagement.API.Services
{
    public class MaterialNameService : IMaterialNameService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public MaterialNameService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<MaterialNameDto>> GetAllAsync()
        {
            var entities = await _context.MaterialNames.ToListAsync();
            return _mapper.Map<IEnumerable<MaterialNameDto>>(entities);
        }

        public async Task<IEnumerable<MaterialNameDto>> GetActiveAsync()
        {
            var entities = await _context.MaterialNames
                .Where(x => x.IsActive)
                .OrderBy(x => x.Name)
                .ToListAsync();
            return _mapper.Map<IEnumerable<MaterialNameDto>>(entities);
        }

        public async Task<MaterialNameDto> GetByIdAsync(int id)
        {
            var entity = await _context.MaterialNames.FindAsync(id);
            return _mapper.Map<MaterialNameDto>(entity);
        }

        public async Task<MaterialNameDto> CreateAsync(MaterialNameDtoCreate dto, int userId)
        {
            if (!await IsCodeUniqueAsync(dto.Code))
                throw new InvalidOperationException($"Material name code '{dto.Code}' already exists.");

            var entity = _mapper.Map<MaterialName>(dto);
            entity.CreatedBy = userId;
            entity.CreatedAt = DateTime.Now;

            _context.MaterialNames.Add(entity);
            await _context.SaveChangesAsync();
            
            return _mapper.Map<MaterialNameDto>(entity);
        }

        public async Task<MaterialNameDto> UpdateAsync(int id, MaterialNameDtoCreate dto, int userId)
        {
            var existing = await _context.MaterialNames.FindAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Material name with ID {id} not found.");

            if (!await IsCodeUniqueAsync(dto.Code, id))
                throw new InvalidOperationException($"Material name code '{dto.Code}' already exists.");

            _mapper.Map(dto, existing);
            existing.UpdatedBy = userId;
            existing.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return _mapper.Map<MaterialNameDto>(existing);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.MaterialNames.FindAsync(id);
            if (entity == null) return false;

            _context.MaterialNames.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null)
        {
            var query = _context.MaterialNames.Where(x => x.Code == code);
            
            if (excludeId.HasValue)
                query = query.Where(x => x.Id != excludeId.Value);

            return !await query.AnyAsync();
        }
    }
}