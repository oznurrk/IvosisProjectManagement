public interface IMaterialNameService
{
    Task<IEnumerable<MaterialNameDto>> GetAllAsync();
    Task<IEnumerable<MaterialNameDto>> GetActiveAsync();
    Task<MaterialNameDto> GetByIdAsync(int id);
    Task<MaterialNameDto> CreateAsync(MaterialNameDtoCreate dto, int userId);
    Task<MaterialNameDto> UpdateAsync(int id, MaterialNameDtoCreate dto, int userId);
    Task<bool> DeleteAsync(int id);
    Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
}