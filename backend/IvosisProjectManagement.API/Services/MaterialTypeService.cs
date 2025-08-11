using AutoMapper;
using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace IvosisProjectManagement.API.Services
{
    public class MaterialTypeService : IMaterialTypeService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public MaterialTypeService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<MaterialTypeDto>> GetAllAsync()
        {
            var entities = await _context.MaterialTypes
                .Include(x => x.MaterialName)
                .ToListAsync();
            return _mapper.Map<IEnumerable<MaterialTypeDto>>(entities);
        }

        public async Task<IEnumerable<MaterialTypeDto>> GetActiveAsync()
        {
            var entities = await _context.MaterialTypes
                .Include(x => x.MaterialName)
                .Where(x => x.IsActive)
                .OrderBy(x => x.Name)
                .ToListAsync();
            return _mapper.Map<IEnumerable<MaterialTypeDto>>(entities);
        }

        public async Task<IEnumerable<MaterialTypeDto>> GetByMaterialNameIdAsync(int materialNameId)
        {
            var entities = await _context.MaterialTypes
                .Include(x => x.MaterialName)
                .Where(x => x.MaterialNameId == materialNameId && x.IsActive)
                .OrderBy(x => x.Name)
                .ToListAsync();
            return _mapper.Map<IEnumerable<MaterialTypeDto>>(entities);
        }

        public async Task<MaterialTypeDto> GetByIdAsync(int id)
        {
            var entity = await _context.MaterialTypes
                .Include(x => x.MaterialName)
                .FirstOrDefaultAsync(x => x.Id == id);
            return _mapper.Map<MaterialTypeDto>(entity);
        }

        public async Task<MaterialTypeDto> CreateAsync(MaterialTypeDtoCreate dto, int userId)
        {
            if (!await IsCodeUniqueAsync(dto.Code))
                throw new InvalidOperationException($"Material type code '{dto.Code}' already exists.");

            var entity = _mapper.Map<MaterialType>(dto);
            entity.CreatedBy = userId;
            entity.CreatedAt = DateTime.Now;

            _context.MaterialTypes.Add(entity);
            await _context.SaveChangesAsync();
            
            return _mapper.Map<MaterialTypeDto>(entity);
        }

        public async Task<MaterialTypeDto> UpdateAsync(int id, MaterialTypeDtoCreate dto, int userId)
        {
            var existing = await _context.MaterialTypes.FindAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Material type with ID {id} not found.");

            if (!await IsCodeUniqueAsync(dto.Code, id))
                throw new InvalidOperationException($"Material type code '{dto.Code}' already exists.");

            _mapper.Map(dto, existing);
            existing.UpdatedBy = userId;
            existing.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return _mapper.Map<MaterialTypeDto>(existing);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.MaterialTypes.FindAsync(id);
            if (entity == null) return false;

            _context.MaterialTypes.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null)
        {
            var query = _context.MaterialTypes.Where(x => x.Code == code);
            
            if (excludeId.HasValue)
                query = query.Where(x => x.Id != excludeId.Value);

            return !await query.AnyAsync();
        }
    }
}
