public interface IUnitService
{
    Task<List<UnitDto>> GetAllAsync();
    Task<UnitDto?> GetByIdAsync(int id);
    Task<UnitDto> CreateAsync(UnitCreateDto dto);
    Task<bool> UpdateAsync(int id, UnitUpdateDto dto);
    Task<bool> DeleteAsync(int id);
}
