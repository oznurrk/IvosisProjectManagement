public interface IMaterialTypeService
{
    Task<IEnumerable<MaterialTypeDto>> GetAllAsync();
    Task<IEnumerable<MaterialTypeDto>> GetActiveAsync();
    Task<IEnumerable<MaterialTypeDto>> GetByMaterialNameIdAsync(int materialNameId);
    Task<MaterialTypeDto> GetByIdAsync(int id);
    Task<MaterialTypeDto> CreateAsync(MaterialTypeDtoCreate dto, int userId);
    Task<MaterialTypeDto> UpdateAsync(int id, MaterialTypeDtoCreate dto, int userId);
    Task<bool> DeleteAsync(int id);
    Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
}