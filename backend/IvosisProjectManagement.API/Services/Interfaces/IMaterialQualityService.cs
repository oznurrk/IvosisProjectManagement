public interface IMaterialQualityService
{
    Task<IEnumerable<MaterialQualityDto>> GetAllAsync();
    Task<IEnumerable<MaterialQualityDto>> GetActiveAsync();
    Task<IEnumerable<MaterialQualityDto>> GetByMaterialTypeIdAsync(int materialTypeId);
    Task<MaterialQualityDto> GetByIdAsync(int id);
    Task<MaterialQualityDto> CreateAsync(MaterialQualityDtoCreate dto, int userId);
    Task<MaterialQualityDto> UpdateAsync(int id, MaterialQualityDtoCreate dto, int userId);
    Task<bool> DeleteAsync(int id);
    Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
}