using AutoMapper;
using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace IvosisProjectManagement.API.Services
{
    public class MaterialQualityService : IMaterialQualityService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public MaterialQualityService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<MaterialQualityDto>> GetAllAsync()
        {
            var entities = await _context.MaterialQualities
                .Include(x => x.MaterialType)
                .ToListAsync();
            return _mapper.Map<IEnumerable<MaterialQualityDto>>(entities);
        }

        public async Task<IEnumerable<MaterialQualityDto>> GetActiveAsync()
        {
            var entities = await _context.MaterialQualities
                .Include(x => x.MaterialType)
                .Where(x => x.IsActive)
                .OrderBy(x => x.Name)
                .ToListAsync();
            return _mapper.Map<IEnumerable<MaterialQualityDto>>(entities);
        }

        public async Task<IEnumerable<MaterialQualityDto>> GetByMaterialTypeIdAsync(int materialTypeId)
        {
            var entities = await _context.MaterialQualities
                .Include(x => x.MaterialType)
                .Where(x => x.MaterialTypeId == materialTypeId && x.IsActive)
                .OrderBy(x => x.Name)
                .ToListAsync();
            return _mapper.Map<IEnumerable<MaterialQualityDto>>(entities);
        }

        public async Task<MaterialQualityDto> GetByIdAsync(int id)
        {
            var entity = await _context.MaterialQualities
                .Include(x => x.MaterialType)
                .FirstOrDefaultAsync(x => x.Id == id);
            return _mapper.Map<MaterialQualityDto>(entity);
        }

        public async Task<MaterialQualityDto> CreateAsync(MaterialQualityDtoCreate dto, int userId)
        {
            if (!await IsCodeUniqueAsync(dto.Code))
                throw new InvalidOperationException($"Material quality code '{dto.Code}' already exists.");

            var entity = _mapper.Map<MaterialQuality>(dto);
            entity.CreatedBy = userId;
            entity.CreatedAt = DateTime.Now;

            _context.MaterialQualities.Add(entity);
            await _context.SaveChangesAsync();
            
            return _mapper.Map<MaterialQualityDto>(entity);
        }

        public async Task<MaterialQualityDto> UpdateAsync(int id, MaterialQualityDtoCreate dto, int userId)
        {
            var existing = await _context.MaterialQualities.FindAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Material quality with ID {id} not found.");

            if (!await IsCodeUniqueAsync(dto.Code, id))
                throw new InvalidOperationException($"Material quality code '{dto.Code}' already exists.");

            _mapper.Map(dto, existing);
            existing.UpdatedBy = userId;
            existing.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return _mapper.Map<MaterialQualityDto>(existing);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.MaterialQualities.FindAsync(id);
            if (entity == null) return false;

            _context.MaterialQualities.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null)
        {
            var query = _context.MaterialQualities.Where(x => x.Code == code);
            
            if (excludeId.HasValue)
                query = query.Where(x => x.Id != excludeId.Value);

            return !await query.AnyAsync();
        }
    }
}